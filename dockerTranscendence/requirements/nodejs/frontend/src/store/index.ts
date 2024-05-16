import { InjectionKey } from 'vue';
import { createStore, useStore as baseUseStore, Store, ActionContext } from 'vuex';
import axios from 'axios';

export interface State {
  count: number;
  data: any[]; // Add your data structure here
}

export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    // currentUser, loggedIn = 0 , etc
    data: [],
  },
  mutations: {
    setUsers(state, data) {
      state.data = data;
    },
    updateWon(state, { userId, won }) {
      console.log(userId);
      const user = state.data.find(user => user.type === userId);
      if (user) {
        user.won = won;
      }
    },
    // mutations allowed, make the one to change the nickname @loadButton
  },
  actions: {
    async fetchData(context: ActionContext<State, State>) {
      try {
        const response = await axios.get('http://localhost:3000/users'); // just http://localhost:3000/ if backend in nest
        context.commit('setUsers', response.data);
        //  console.log(response.data);
        return response.data; // Return the fetched data
      } catch (error) {
        console.error('Error fetching user data: Fake or Real Backend is not running!', error);
      }
    },
  },
});

export function useStore() {
  return baseUseStore(key);
}
