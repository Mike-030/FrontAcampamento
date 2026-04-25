import { mount } from 'svelte'
import './app.css'
// @ts-ignore
import App from './App.svelte'

/** @type {HTMLElement} */
const target = document.getElementById('app') || document.body;

const app = mount(App, {
  target: target,
})

export default app
