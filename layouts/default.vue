<template>
  <v-app dark>
    <!-- <v-navigation-drawer
      :mini-variant.sync="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      fixed
      app
    >
      <v-list>
        <v-list-tile
          router
          :to="item.to"
          :key="i"
          v-for="(item, i) in items"
          exact
        >
          <v-list-tile-action>
            <v-icon v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer> -->
    <v-toolbar fixed app :clipped-left="clipped">
      <!-- <v-toolbar-side-icon @click="drawer = !drawer"></v-toolbar-side-icon> -->
      <!-- <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
      </v-btn> -->
      <!-- <v-btn icon @click.stop="clipped = !clipped">
        <v-icon>web</v-icon>
      </v-btn> -->
      <!-- <v-btn icon @click.stop="fixed = !fixed" >
        <v-icon>remove</v-icon>
      </v-btn> -->
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click.stop="goTo('/')">
        <v-icon>home</v-icon>
      </v-btn>
      <v-btn icon @click.stop="login" v-if="!user">
        <v-icon>face</v-icon>
      </v-btn>
      <v-btn icon @click.stop="addNewPlayerModal = !addNewPlayerModal" v-if="user && user.isAllowed">
        <v-icon>person_add</v-icon>
      </v-btn>
      <v-btn icon @click.stop="goTo('/matches')">
        <v-icon>videogame_asset</v-icon>
      </v-btn>
      <!-- <v-btn icon @click.stop="rightDrawer = !rightDrawer" >
        <v-icon>menu</v-icon>
      </v-btn> -->
    </v-toolbar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-dialog v-model="addNewPlayerModal" max-width="500px">
        <v-card>
          <v-card-title>
            Add a new player
          </v-card-title>
          <v-card-text>
            <v-form v-model="player.valid">
              <v-text-field
                label="Name"
                v-model="player.name"
                :rules="player.nameRules"
                :counter="50"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" flat @click.stop="addNewPlayerModal=false">Close</v-btn>
            <v-btn color="green" flat @click.stop="saveNewPlayer">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    <!-- <v-navigation-drawer
      temporary
      :right="right"
      v-model="rightDrawer"
      fixed
    >
      <v-list>
        <v-list-tile @click.native="right = !right">
          <v-list-tile-action>
            <v-icon light>compare_arrows</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Switch drawer (click me)</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer> -->
    <v-footer :fixed="fixed" app>
      <span>&copy; 2018 William Penagos</span>
    </v-footer>
  </v-app>
</template>

<script>
import { auth, firebase } from '../plugins/firebase'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      player: {
        valid: false,
        name: '',
        nameRules: [
          v => !!v || 'Name is required',
          v => v.length <= 500 || 'Name must be less than 500 characters'
        ]
      },
      addNewPlayerModal: false,
      clipped: false,
      drawer: true,
      fixed: false,
      items: [
        { icon: 'apps', title: 'Data', to: '/' },
        { icon: 'bubble_chart', title: 'Login', to: '/login' }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Imaginamos Cali Open 2018'
    }
  },
  mounted () {
    if (process.browser) {
      auth().onAuthStateChanged((user) => {
        if (user) {
          this.$store.dispatch('saveUser', user)
        }
      })
      this.$store.dispatch('init')
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  methods: {
    goTo (match) {
      this.$router.push(match)
    },
    saveNewPlayer () {
      this.$store.dispatch('savePlayer', this.player.name).then(() => {
        this.player.name = ''
        // this.addNewPlayerModal = false
      })
    },
    login () {
      const provider = new firebase.auth.GoogleAuthProvider()
      auth().signInWithPopup(provider).then((result) => {
        console.log(result.user)
      }).catch((error) => {
        const errorMessage = error.message
        console.log(error)
        alert(`Hubo un error ${errorMessage}`)
      })
    }
  }
}
</script>
