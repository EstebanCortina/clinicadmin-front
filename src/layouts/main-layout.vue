<template>
  <v-app>
    <v-navigation-drawer app>
      <v-list dense>
        <v-list-item to="/citas" router exact>
          <v-list-item-content><v-list-item-title>Citas</v-list-item-title></v-list-item-content>
        </v-list-item>
        <v-list-item to="/pacientes" router>
          <v-list-item-content><v-list-item-title>
            Pacientes
        </v-list-item-title></v-list-item-content>
        </v-list-item>
        <v-list-item to="/tratamientos" router>
          <v-list-item-content>
            <v-list-item-title>
                Tratamientos
            </v-list-item-title>
        </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Clínica Médica</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text @click="logout">Salir</v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    },
  },
};

</script>
