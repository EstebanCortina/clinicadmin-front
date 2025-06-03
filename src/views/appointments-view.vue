<template>
  <v-appointments-table-com>
    <div><h1>Citas</h1></div>
  </v-appointments-table-com>
</template>

<script>
import AppointmentsTableCom from '@/components/appointments-table-com.vue';

export default {
  name: 'AppointmentsView',
  components: {
    'v-appointments-table-com': AppointmentsTableCom,
  },
};
</script>
