<!-- % Setting up -->

To start working with DataPeps, you need to add DataPeps SDK to your project.

## Using a package manager

The simplest way to get started, is to add DataPeps SDK, using your favourite package manager.

### npm

Go to your project directory and run:

```bash
npm install datapeps-sdk
```

### yarn

Go to your project directory and run:

```bash
yarn add datapeps-sdk
```

## Instantiation of DataPeps SDK

Just add the following line to your code to import the DataPeps SDK:

```typescript
import * as DataPeps from 'datapeps-sdk';
```

## Using the SDK with Node.js

When using DataPeps SDK with [Node.js](https://nodejs.org/) (on backend or if testing with [Mocha](https://mochajs.org/)), you need to add the following packages:
* [@types/text-encoding](https://www.npmjs.com/package/@types/text-encoding)
* [atob](https://www.npmjs.com/package/atob)
* [btoa](https://www.npmjs.com/package/btoa)
* [text-encoding](https://www.npmjs.com/package/text-encoding)
* [ws](https://www.npmjs.com/package/ws)
* [xhr2](https://www.npmjs.com/package/xhr2)

The components above are supported by browsers, but when calling DataPeps API on backend, you need to add them to the project manually along with a couple of lines to configure their usage. We'll show how to do it [further](#adding-dependencies-for-nodejs).

## Hello, DataPeps!

Let's have a glimpse at how exactly DataPeps simplifies cryptography for a developer.

Say there are two friends, Alice and Bob. Alice wants to share a nice photo of a cheetah with Bob; however, Alice is quite rather concerned about data security (good for her!), and she wants to ensure, that only Bob can eventually see the picture. DataPeps to the rescue!

First, we will show you Alice's part:

```typescript
async function aliceSend(sdk, fileName) {
    let session = await sdk.login("alice@datapeps.com", "pass")
    let resource = await session.Resource.create("img/jpg", "", ["bob@datapeps.com"])
    let photo = await readFile(fileName)
    let encryptedPhoto = resource.encrypt(photo)
    await writeFile("encrypted_" + fileName, encryptedPhoto)
    return [resource.id, "encrypted_" + fileName]
}
```

and Bob's part:

```typescript
async function bobReceive(
        sdk,
        resourceId,
        encryptedFileName) {
    let session = await sdk.login("bob@peps.test", "pass")
    let resource = await session.Resource.get(resourceId)
    let encryptedData = await readFile(encryptedFileName)
    let decryptedData = resource.decrypt(encryptedData)
    await writeFile("decrypted_" + encryptedFileName, decryptedData)
}
```

Short and awesome! Now, let's discuss it a bit.

Suppose, Alice and Bob are already registered with DataPeps (we cover the case when they are not a bit [further](#identity-registration)). First of all, Alice needs to [establish a session](Session#session-establishment) with DataPeps server:

```typescript
let session = await sdk.login("alice@datapeps.com", "pass")
```
Now, as Alice wants only Bob to have access to the picture, she needs to encrypt it for Bob (and only Bob). For this Alice [creates](Resource#creating-a-resource) "[a resource](Resource)":

```typescript
let resource = await session.Resource.create("img/jpg", "", ["bob@datapeps.com"])
```

Last, Alice encrypts the photo and saves the result:

```typescript
let photo = await readFile(fileName)
let encryptedPhoto = resource.encrypt(photo)
await writeFile("encrypted_" + fileName, encryptedPhoto)
```

Alice sends Bob the encrypted file and the resource's ID:

```typescript
return [resource.id, "encrypted_" + fileName]
```

When Bob wants to decrypt the encrypted file from Alice, he establishes the session (the same way Alice did) and fetches the resource, created by Alice from the DataPeps server, using the resource id:

```typescript
let session = await sdk.login("bob@peps.test", "pass")
let resource = await session.Resource.get(resourceId)
```

Bob decrypts the file and saves the result:

```typescript
let encryptedData = await readFile(encryptedFileName)
let decryptedData = resource.decrypt(encryptedData)
await writeFile("decrypted_" + encryptedFileName, decryptedData)
```

### Adding dependencies for Node.js

We will use Node.js to run the resulting code, so we will need to satisfy all the relevant [dependencies](#using-the-sdk-with-nodejs):

```typescript
declare var global: any  
global["TextEncoder"] = require('text-encoding').TextEncoder                                                                                                                                                                                                            
global["TextDecoder"] = require('text-encoding').TextDecoder                                                                                                                                                                                               
global["XMLHttpRequest"] = require('xhr2')                                                                                                                                                                                                                                                          
global["WebSocket"] = require('ws')                                                                              
global["btoa"] = require('btoa')
global["atob"] = require('atob')
```

## "Hello, DataPeps" code

Here is the complete example, with definitions of *readFile* and *writeFile* functions:

<details>
  <summary>
    Show code
  </summary>

```typescript
declare var global: any  
global["TextEncoder"] = require('text-encoding').TextEncoder                                                                                                                                                                                                            
global["TextDecoder"] = require('text-encoding').TextDecoder                                                                                                                                                                                               
global["XMLHttpRequest"] = require('xhr2')                                                                                                                                                                                                                                                          
global["WebSocket"] = require('ws')                                                                              
global["btoa"] = require('btoa')
global["atob"] = require('atob')

import * as Peps from 'pepssdk'
import * as Fs from 'fs'

function readFile(filePath: string) {
    return new Promise<Buffer>((resolve, reject) => {
        let data = Fs.readFile(filePath, (e, data) => {
            if (e) {
                return reject(e)
            }
            return resolve(data)
        })
    })
}

function writeFile(filePath, data) {
    return new Promise<void>((resolve, reject) => {
        Fs.writeFile(filePath, data, (e) => {
            if (e) {
                return reject(e)
            }
            return resolve()
        })
    })
}

async function aliceSend(, fileName) {
    let session = await sdk.login("alice@datapeps.com", "pass")
    let resource = await session.Resource.create("img/jpg", "", ["bob@datapeps.com"])
    let photo = await readFile(fileName)
    let encryptedPhoto = resource.encrypt(photo)
    await writeFile("encrypted_" + fileName, encryptedPhoto)
    return [resource.id, "encrypted_" + fileName]
}

async function bobReceive(
        sdk,
        resourceId,
        encryptedFileName) {
    let session = await sdk.login("bob@datapeps.com", "pass")
    let resource = await session.Resource.get(resourceId)
    let encryptedData = await readFile(encryptedFileName)
    let decryptedData = resource.decrypt(encryptedData)
    await writeFile("decrypted_" + encryptedFileName, decryptedData)
}

async function main() {
    var sdk = new Peps.SDK("https://192.168.99.100:32511")
    var [resourceId, encryptedFileName] = await aliceSend(sdk, "awmore.jpg")
    await bobReceive(sdk, resourceId, encryptedFileName)
}

main().catch((_) => process.stdout.write("An error has occurred\n"))
```
</details>
<br>
Finally, create the following *package.json* in the project directory:

```json
{
    "name": "hello-datapeps",
    "version": "0.0.1",
    "main": "hello-datapeps.js",
    "scripts": {
        "start": "node hello-datapeps.js"
    },
    "dependencies": {
        "pepssdk": "^0.0.5",
        "@types/text-encoding": "0.0.31",
        "atob": "^2.0.3",
        "btoa": "^1.1.2",
        "text-encoding": "^0.6.4",
        "ws": "^3.3.2",
        "xhr2": "^0.1.4"
    }
}
```

and the following *tsconfig.json* (for compiling TypeScript):

```json
{
    "compilerOptions": {
        "lib": [
            "dom",
            "es2015.promise",
            "es6"
        ],
        "module": "commonjs",
        "target": "es5"
    }
}
```

Compile and run the code:

```bash
npm install && tsc && npm start
```

If you use yarn instead of npm, run:

```bash
yarn install && tsc && yarn run start
```
