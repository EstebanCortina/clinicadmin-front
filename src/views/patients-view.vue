<template>
  <v-patients-cards-com>
    <div><h1>Pacientes</h1></div>
  </v-patients-cards-com>
</template>

<script>
import PatientsCardsCom from '@/components/patients-cards-com.vue';

export default {
  name: 'PatientsView',
  components: {
    'v-patients-cards-com': PatientsCardsCom,
  },
};
</script>
