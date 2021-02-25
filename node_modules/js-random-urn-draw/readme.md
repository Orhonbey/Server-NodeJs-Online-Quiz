# JS Random Urn Draw
![npm](https://img.shields.io/npm/v/js-random-urn-draw)
![GitHub](https://img.shields.io/github/license/henrik-detjen/js-random-urn-draw)
![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/js-random-urn-draw)
![npm](https://img.shields.io/npm/dt/js-random-urn-draw)
![npm](https://img.shields.io/npm/dw/js-random-urn-draw)
![Tests](https://github.com/henrik-detjen/js-random-urn-draw/workflows/Node.js%20CI/badge.svg)

A simple js-class to put an array into an urn and draw random items from it - with or without replacement.

## Installation
Download this project via Github and add it manually to your project 
or install the JSON File Storage npm / yarn package: 

``npm i js-random-urn-draw`` / 
``yarn add js-random-urn-draw``

## How to Use / API
```javascript

const Urn = require('js-random-urn-draw'); // adjust the require path, if not installed via npm/yarn


const items = ["🍏", "🍒", "🍌"];


// urn WITH replacement
const urn = new Urn(items);

urn.drawOne(); // "🍌"
urn.draw(5); // ["🍒", "🍏", "🍒", "🍌", "🍌"]

urn.shake(); // ["🍌", "🍏", "🍒"]


// urn WITHOUT replacement
const urn_without = new Urn(items, false);

urn_without.drawOne(); // "🍌"
urn_without.content; // ["🍏", "🍒"]
urn_without.extractedContent; // ["🍌"]

urn.draw(5); //  ["🍏", "🍒"]
urn_without.content; // []
urn_without.extractedContent; // ["🍏", "🍒", "🍌"]

```


## Donate
If you like the project and it saved you a while of coding, spend me a coffee (or all of your savings) to keep me motivated: [paypal.me](https://paypal.me/detjen)
