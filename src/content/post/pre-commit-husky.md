---
title: 'Pre-Commit Linting with Husky & Prettier'
publishDate: '30 April 2022'
updatedDate: '27 August 2023'
description: 'Learn how to setup pre-commit linting using Prettier and newer versions of Husky'
tags: ['tools']
---

_This tutorial specifically targets Husky versions 5 and 6._

Pre-Commit hooks are a neat way to help keep code bases clean and avoid introducing unnecessary noise during the code review process. I commonly use pre commit hooks to run linting, tests, or check for other trivial things that need not be pointed out in Pull Requests leaving more time to focus on more important changes.

[Husky](https://github.com/typicode/husky) makes using Git hooks quite easy but setup can be confusing with newer versions. Since v5 support of an entry in the `package.json` has been dropped so a lot of tutorials are out of date.

### Requirements

- Prettier (installed as a dev dependency in your project)
- npm or yarn

### Install Husky

We can start by adding [Husky to our project](https://typicode.github.io/husky/#/?id=install). If you are already using an older version of Husky (v4), you can skip the rest of this blog and just follow [this migration guide](https://typicode.github.io/husky/#/?id=migrate-from-v4-to-v6).

```bash
npx husky-init && npm install       # npm
npx husky-init && yarn install       # Yarn 1
yarn dlx husky-init --yarn2 && yarn install # Yarn 2
```

This does a few things:

- A `.husky` directory added to the root of the project. This is the default Husky directory where hooks will live.
- A simple `pre-commit` hook is created under this directory which we can tailor as we see fit.

### Install pretty-quick

[pretty-quick](https://github.com/azz/pretty-quick#readme) will run Prettier on your changed files. Add this as a dev dependency to your project.

```bash
npm install --d pretty-quick        # npm
yarn add -D pretty-quick            # Yarn
```

### Configure the Hook

To run pretty-quick as part of our pre-commit hook, we simply need to add a command for it

Add to package.json a new script to run from the hook

```json
{
  ...,
  "pre-commit-checks": "pretty-quick --staged"
}
```

Then add this script to the pre-commit hook that was created under `.husky/pre-commit`

```
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run pre-commit-checks

```

### Commit!

All done. That's it. Go ahead and make changes as usual. The next time you commit, you will see your pre-commit hook execute.

#### Notes

You can see some other options for combining Prettier with Pre-Commit tools [here](https://prettier.io/docs/en/precommit.html).