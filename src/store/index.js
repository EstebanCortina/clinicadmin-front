import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    logout(state) {
      state.user = null;
    },
  },
  actions: {
    login({ commit }, { email, password }) {
      // Simulación de login
      if (email === 'admin@clinica.com' && password === '123456') {
        const user = { email };
        localStorage.setItem('user', JSON.stringify(user));
        commit('setUser', user);
        return true;
      }
      return false;
    },
    logout({ commit }) {
      localStorage.removeItem('user');
      commit('logout');
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
  },
});
