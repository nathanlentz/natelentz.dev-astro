---
title: 'Versioning your Angular apps with Azure Pipelines'
publishDate: '14 September 2023'
description: 'Version your frontend web applications with Azure Piplines.'
tags: ['tools', 'azure']
---

## The Problem
A common issue with single-page applications (SPAs) is that the main index.html file tends to get cached by users' browsers. This caching behavior can make it challenging to push updates to users effectively. When the index.html file is cached, users may continue to see the old version of the SPA even after updates have been deployed. There are many different cache-busting solutions which can be implemented - my favorite being versioning. In some CI/CD scenarios, it isn't exactly trivial to publish Build Versions into your web applications. This guide will cover how I do it using __Azure Pipelines__. This will not solve issues where a CDN may be caching served files and is only meant to make the client aware it may be running out of date code. Therefore, it may only be a partial solution to a bigger problem.

## Solution with CI/CD
Simply updating the "version" in a frontend projects `package.json` file isn't enough - we need to separate the "version" out of the bundled web application and put it somehwere the client app can reliably look to evaluate if parity exists between what is running in the browser and what latest is on the server. We can do this by doing two things:

1. Write our build version to a static file deployed to our web server (we'll call it `version.json`)
2. Write our build version into the built/deployed Angular App to compare against what is in the `version.json`

## The Concept

We will add a new build pipeline step that creates and writes to a new `version.json` file to be deployed to the `public` folder for our Angular app. It might look like this:

```
{
  "version": "1.0.0+20230815.2"
}
```

We will also perform __token replacement__ against the built Angular project to write this same version number into the code bundled during our CI process. We can then implement a simple Angular Service which is responsible for comparing the version on the client to the version on the Server. If the versions do not match, it means the client must be out of date and we can prompt the user to refresh (or perform any other desired action)!

## Build Pipeline (YAML)
Create a new Library Group in ADO.
  - Add a new variable called `AZURE_APP_VERSION` with value `$(Build.SourceBranchName)+$(Build.BuildNumber)`. This will be used by our Build Pipeline.

There are three tasks required in the Build Pipeline responsible for building our Angular application.

The first task is a Powershell scripts responsible for writing the Source Branch Name & ADO Pipieline Build Number to a variable which is used to populate our `version.json` file.

The second task simply creates our `version.json` file and places it within the `src` directory of the Angular Application.

The third task handles replacing the version token in our `index.html` file by finding the token with value `#{ AZURE_APP_VERSION }#`

``` yaml
- task: PowerShell@2
    displayName: Powershell Set Version
    inputs:
      targetType: inline
      script: >+
        Write-Host("Source branch is $env:BUILD_SOURCEBRANCH")

        $versionInfo = "$(Build.SourceBranchName)+$(Build.BuildNumber)"

        Write-Host("New release build number is $versionInfo")

        Write-Host("##vso[task.setvariable variable=Version;]$versionInfo")

- task: file-creator@6
  displayName: Create version.json
  inputs:
    filepath: $(System.DefaultWorkingDirectory)/src/version.json
    filecontent: >-
      {
        "version": "$(Version)"
      }
    fileoverwrite: true
- task: replacetokens@5
  inputs:
    rootDirectory: './'
    targetFiles: '**/*index.html'
    encoding: 'auto'
    tokenPattern: 'default'
    writeBOM: true
    actionOnMissing: 'warn'
    keepToken: false
    actionOnNoFiles: 'continue'
    enableTransforms: false
    enableRecursion: false
    useLegacyPattern: false
    enableTelemetry: false
```

## Angular App
You may reference this Stackblitz Angular app I setup which demonstrates the work I explain below.

1. Insert Meta value to your application's root `Index.html` file. This meta element will contain a token the Azure build pipeline will replace with the Version Info. The Angular app can then evaluate this at runtime.

``` html
<meta name="version" content="#{ AZURE_APP_VERSION }#">
```

2. App Version Service. This service contains work to fetch the version.json file from the server and compare it to the meta value created above.

``` ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Meta } from "@angular/platform-browser";
import { Observable, of, tap, interval } from "rxjs";
import { environment } from '../environments/environment';

export class AppVersion {
  version: string;
}

@Injectable()
export class AppVersionService {
  private _remoteVersion: AppVersion
  private _clientVersion: string

  constructor(
    private http: HttpClient,
    private meta: Meta
  ) {
    this._clientVersion = meta.getTag('name = "version"')?.content ?? 'DEV';
  }

  public get getRemoteVersion() {
    return this._remoteVersion
  }

  public get getClientVersion() {
    return this._clientVersion
  }

  public $observeVersion = interval(5000).pipe(
    switchMap(() => fetchVersion()),
    catchError((error) => {
      console.error('Oh no!')
      return of(null)
    }),
    map((response) => {
      this._remoteVersion = response
      const isCurrent = this._remoteVersion.version === this._clientVersion
      return of(isCurrent)
    })
  )

  private fetchVersion(): Observable<AppVersion> {
    if (!environment.production) {
      return of(null);
    }

    console.log(`%cApp Version: ${this._clientVersion}`, 'color: #00C24E')

    // Unique timestamp as query param to ensure it's always fetched from the server
    return this.http.get<AppVersion>(`/version.json?t=${Date.now()}`)
  }

  public validateVersion(): void {
    if (!environment.production) {
      return
    }

    if (this._remoteVersion.version === this._clientVersion) {
      return
    }

    const versions = {
      client: this._clientVersion,
      server: this._remoteVersion
    }

    console.log(`%cClient Out of Date!`, 'color: #ff0000', versions)
  }
}
```

3. We can then use this Service from anywhere in our application to perform work after the validation. Below illustrates a simple check that you could perform that subscribes to an observable which polls the server `version.json` file every 5 seconds.

``` ts
this.appVersionService.$observeVersion.subscribe((isCurrent) => {
  if(!isCurrent) {
    console.log('Update is available! Do stuff!')
  }
})
```

## Summary
This is a non-trivial way to integrate Azure Build information directly into your Angular App. However, it enables you to handle updates to frontend code in a reliable manner. Using this, you can prompt the user to refresh, force a refresh, or even sign the user out. Keep in mind, the user might be in the middle of doing something! It could be an invoncenice or they may lose data if you force a user to do something without a prompt. Have fun hacking.


 