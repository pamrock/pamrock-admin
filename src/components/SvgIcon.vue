<script setup>
defineProps({
  icon: String,
  className: String
})
</script>

<template>
  <svg :class="['svg-icon', className]" aria-hidden="true">
    <use :xlink:href="`#icon-${icon}`" />
  </svg>
</template>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
