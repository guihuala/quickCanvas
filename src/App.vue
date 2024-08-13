<template>
  <div id="app">
    <DrawingBoard />
    <Footer />
  </div>
</template>

<script setup>
import DrawingBoard from './components/DrawingBoard.vue';
import Footer from './components/Footer.vue';
</script>

<style>
body {
  margin: 0;
  place-items: center;
  overflow-x: hidden;
  background-color: rgb(236, 236, 236);
}
</style>