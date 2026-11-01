<script setup lang="ts">
defineProps<{ disabled: boolean }>()
defineEmits<{ download: [] }>()
</script>
<template>
  <button class="button primary download-button" :disabled="disabled" @click="$emit('download')">
    <span aria-hidden="true">↓</span> Download cleaned CSV
  </button>
</template>
