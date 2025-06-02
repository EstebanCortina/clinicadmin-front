<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="headline">Iniciar sesión</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="email"
                label="Correo"
                type="email"
                required
              />
              <v-text-field
                v-model="password"
                label="Contraseña"
                type="password"
                required
              />
              <v-btn color="primary" type="submit" block>Entrar</v-btn>
              <v-alert v-if="error" type="error" dense>{{ error }}</v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      error: '',
    };
  },
  methods: {
    async login() {
      const success = await this.$store.dispatch('login', {
        email: this.email,
        password: this.password,
      });

      if (success) {
        this.$router.push('/citas');
      } else {
        this.error = 'Credenciales inválidas';
      }
    },
  },
};
</script>
