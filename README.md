# vue3-confirm-dialog-box

Simple Confirm Dialog verification plugin with Vue 3.

Demo: https://github.com/anilshr25/vue3-confirm-dialog-box

![confirm-dialog](https://raw.githubusercontent.com/anilshr25/vue3-confirm-dialog-box/main/src/assets/confirm-dialog.png)


## Install

```bash
npm install --save vue3-confirm-dialog-box
```

## Quick Start Usage

In main.js or plugin (for Nuxt.js):

```js
import { createApp } from "vue";
import Vue3ConfirmDialogBox from "vue3-confirm-dialog-box";
import "vue3-confirm-dialog-box/style";

const app = createApp();

app.use(Vue3ConfirmDialogBox);
app.component("vue3-confirm-dialog-box", Vue3ConfirmDialogBox.default);
```
In App.vue (or in the template file for Nuxt.js (layout/default.vue)):

```html
<template>
  <div id="app">
    <vue3-confirm-dialog-box></vue3-confirm-dialog-box>
    <!-- your code -->
  </div>
</template>

<script>
  export default {
    name: "app"
  }
</script>
```
I recommend creating a app-wide notification component for handling all confirmations
## Vue Options API:
```js
methods: {
    handleClick(){
      this.$confirm(
        {
          title: "Confirm your action",
          message: "Are you sure?",
          button: {
            no: "No",
            yes: "Yes"
          },
          /**
          * Callback Function
          * @param {Boolean} confirm
          */
          callback: confirm => {
            if (confirm) {
                console.log("Works");
            }
          }
        }
      )
    }
  }
```
## Inject function for Vue files
The plugin automatically sets global provide() with key "vue3-confirm-dialog".
```js
<script setup>
import { inject } from "vue";

const confirm: (any) = inject("vue3-confirm-dialog-box");

function handleClick() {
  confirm(
        {
          title: "Confirm your action",
          message: "Are you sure?",
          button: {
            no: "No",
            yes: "Yes"
          },
          /**
          * Callback Function
          * @param {Boolean} confirm
          */
          callback: (confirm: boolean) => {
            if (confirm) {
              console.log('Works');
            }
          },
        }
      )
})

</script>
```
