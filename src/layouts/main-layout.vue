<template>
  <v-app>
    <v-navigation-drawer app>
      <v-list dense>
        <v-list-item to="/citas" router exact>
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              Citas
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/pacientes" router>
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              Pacientes
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item to="/tratamientos" router>
          <v-list-item-content>
            <v-list-item-title class="text-h6">
                Tratamientos
            </v-list-item-title>
        </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-img
        src="@/assets/Clinicadmin_favicon.png"
        contain
        max-height="40"
        max-width="40"
        class="mr-3"
        >
      </v-img>
      <v-img
        src="@/assets/Clinicadmin_logotipo.png"
        contain
        max-height="100"
        max-width="200"
        class="mr-3"
        >
      </v-img>
      <v-spacer></v-spacer>
      <v-btn color="error" @click="logout">Salir</v-btn>
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
