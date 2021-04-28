# next-native-image

## Installation
```sh
yarn add next-native-image
```

or

```sh
npm i next-native-image
```

## Usage
Example with [tailwindcss](https://tailwindcss.com) and [https://github.com/tailwindlabs/tailwindcss-aspect-ratio](https://github.com/tailwindlabs/tailwindcss-aspect-ratio):

```javascript
import Image from "next-native-image";

export default function ImageCard() {
  return (
    <div className="bg-white shadow-md max-w-2xl mx-auto rounded overflow-hidden">
      <div className="overflow-hidden">
        <div className="aspect-w-2 aspect-h-1 bg-gray-500">
          <Image
            src="/images/sky.png"
            width={1000}
            layout="native"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      <div className="px-5 py-3">
        <div className="text-gray-700">Image of the sky</div>
      </div>
    </div>
  );
}
```
