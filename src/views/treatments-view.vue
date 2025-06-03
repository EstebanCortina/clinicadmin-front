<template>
  <v-patients-search-treatments>
      <div><h1>Tratamientos</h1></div>
  </v-patients-search-treatments>
</template>

<script>
import PatientsSearchTreatments from '@/components/patients-search-treatments.vue';

export default {
  name: 'PatientsView',
  components: {
    'v-patients-search-treatments': PatientsSearchTreatments,
  },
};
</script>
