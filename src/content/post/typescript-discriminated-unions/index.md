---
title: 'An introduction to Typescript Discriminated Unions'
publishDate: '30 December 2023'
description: 'Learn a Typescript pattern for reducing unnecessary optional values and improving type safety.'
tags: ['frontend', 'typescript']
---


# Discriminated Unions

Typescript Unions provide us a powerful feature that allows __discrimination__ between different Union members.

Discriminated Unions offer an elegant solution for handling all possible object variations reducing the risk for runtime errors. Typescript uses Discriminated Unions to infer types based on a property called the __Discriminator Property__.

The below example does not use a Discriminated Union. You can see how your code may have to perform some additional safety checks to determine the shape of the data. Additionally, we must mark majority of our properties as optional due to the multiple possible states for an ApiResponse to be in.

```ts
interface ApiResponse<T = any> {
  status: 'success' | 'error'
  code: number
  data?: T
  error?: {
    message: string
  }
}
```

In this instance, Typescript will not be able to provide proper type safety. Typescript would allow you to access properties which may not be present at runtime.

```ts
const handleApiResponse = (response: ApiResponse) {
  switch(response.status) {
    case 'success':
      // When status is success, error shouldn't exist.
      console.log(response.error?.message)
      break
    case 'error':
      // When status is error, data shouldn't exists
      console.log(response.data)
      break
    default:
      break
  }
}
```

Let's fix this with a Discriminated Union. We have a Union type called `ApiResponse` composed of the Union between `ApiSuccess` and `ApiError`. In this case, each member has a __literal type__ which we can use as the __discriminator__.

```ts
interface ApiSuccess<TData = any> {
  status: 'success',
  code: number
  data?: TData
}

interface ApiError {
  status: 'error',
  code: number
  error: {
    message: string
  }
}

type ApiResponse = ApiSuccess | ApiError

const handleApiResponse = (response: ApiResponse) => {
  switch(response.status) {
    case 'success':
      // ERROR: error does not exist on type ApiSuccess
      console.log(response.error)
      break
    case 'error':
      // ERROR: data does not exist on type ApiError
      console.log(response.data)
      break
    default:
      break
  }
}
```
TypeScript discriminated unions provide flexibility for working with object types and object variations. The improved type safety makes discriminated unions a must have in your developer toolkit.

Read more about [everyday types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types) with Typescript.
