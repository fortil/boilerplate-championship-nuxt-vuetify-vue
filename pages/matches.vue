<template>
  <v-layout column justify-center align-center>
    <v-flex text-xs-center xs12 sm8 md6>
      <v-tabs v-model="active" color="grey darken-1" dark slider-color="yellow" >
        <v-tab v-for="n in keys" :key="n" ripple>
          {{ n }}
        </v-tab>
        <v-tab-item v-for="n in keys" :key="n" >
          <v-card>
            <v-list two-line subheader>
              <v-subheader inset>{{n}}</v-subheader>
              <v-list-tile avatar v-for="item in items(n)" :key="item.key" @click="">
                <v-list-tile-avatar>
                  <v-icon :class="[item.iconClass]">{{ item.icon }}</v-icon>
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                  <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-btn icon ripple @click.stop="setRecordFn(n, item)">
                    <v-icon color="grey lighten-1">info</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-tab-item>
      </v-tabs>
      <v-dialog v-model="setRecordModal && user && user.isAllowed" max-width="500px" :persistent="true">
        <v-card>
          <v-card-title>
            Add points to
          </v-card-title>
          <v-card-text>
            <v-form v-model="player.valid">
              <v-subheader>Points to: {{player.player1.name}}</v-subheader>
              <v-text-field
                label="Points"
                type="number"
                v-model="player.player1.points"
                :rules="player.nameRules"
                :counter="2"
                required
              ></v-text-field>
              <v-subheader>Points to: {{player.player2.name}}</v-subheader>
              <v-text-field
                label="Points"
                type="number"
                v-model="player.player2.points"
                :rules="player.nameRules"
                :counter="2"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" flat @click.stop="setRecordModal=false">Close</v-btn>
            <v-btn color="green" flat @click.stop="saveNewRecord">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="setInfoModal" max-width="500px" :persistent="true">
        <v-card>
          <v-card-title>
            Match info
          </v-card-title>
          <v-card-text>
            <v-form v-model="player.valid">
              <v-subheader>Points to: {{player.player1.name}}</v-subheader>
              <v-text-field
                type="number"
                v-model="player.player1.points"
                :disabled="true"
              ></v-text-field>
              <v-subheader>Points to: {{player.player2.name}}</v-subheader>
              <v-text-field
                type="number"
                v-model="player.player2.points"
                :disabled="true"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" flat @click.stop="setInfoModal=false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-flex>
  </v-layout>
</template>
<script>
import {mapGetters} from 'vuex'
const toDate = (e) => e ? (new Date(e)).toLocaleString() : (new Date()).toLocaleString()
const getPoints = (e) => e ? `${e.pointsWinner} a ${e.pointsLosser}` : `0 a 0`
export default {
  computed: {
    ...mapGetters(['matchDone', 'matchTodo', 'user', 'players'])
    // items (act) {
    //   if (act === 'Todo') {
    //     return this.matchTodo ? this.matchTodo.map((e) => (
    //       Object.assign({}, e, {icon: 'access_time'}, {iconClass: 'blue lighten-1 white--text'}, {subtitle: 'Not yet'})
    //     )) : []
    //   } else if (act === 'Done') {
    //     return this.matchDone ? this.matchDone.map((e) => (
    //       Object.assign({}, e, {icon: 'done'}, {iconClass: 'green white--text'}, {subtitle: `${toDate(e.date)} - ${getPoints(e.points)}`})
    //     )) : []
    //   }
    //   return []
    // },
    // items2 () {
    //   return this.matchDone ? this.matchDone.map((e) => (
    //     Object.assign({}, e, {icon: 'done'}, {iconClass: 'green white--text'}, {subtitle: `${toDate(e.date)} - ${getPoints(e.points)}`})
    //   )) : []
    // }
  },
  methods: {
    items (act) {
      if (act === 'Todo') {
        return this.matchTodo ? this.matchTodo.map((e) => (
          Object.assign({}, e, {icon: 'access_time'}, {iconClass: 'blue lighten-1 white--text'}, {subtitle: 'Not yet'})
        )) : []
      } else if (act === 'Done') {
        return this.matchDone ? this.matchDone.map((e) => (
          Object.assign({}, e, {icon: 'done'}, {iconClass: 'green white--text'}, {subtitle: `${toDate(e.date)} - ${getPoints(e.points)}`})
        )) : []
      }
      return []
    },
    setRecordFn (act, item) {
      const players = item.key.split('_*_').map((e) => this.players.filter(p => p.uid === e)[0])
      if (act === 'Todo') {
        this.player.player1 = Object.assign({}, this.players.player1, players[0], {points: 0})
        this.player.match = item.key
        this.player.player2 = Object.assign({}, this.players.player2, players[1], {points: 0})
        this.setRecordModal = true
      } else if (act === 'Done') {
        const points1 = item.looser === players[0].uid ? item.points.pointsLosser : item.points.pointsWinner
        const points2 = item.looser === players[1].uid ? item.points.pointsLosser : item.points.pointsWinner
        this.player.player1 = Object.assign({}, this.players.player1, players[0], {points: points1})
        this.player.match = item.key
        this.player.player2 = Object.assign({}, this.players.player2, players[1], {points: points2})
        this.setInfoModal = true
      }
    },
    showInfoModal (item) {
      const players = item.key.split('_*_').map((e) => this.players.filter(p => p.uid === e)[0])
      const points1 = item.looser === players[0].uid ? item.points.pointsLosser : item.points.pointsWinner
      const points2 = item.looser === players[1].uid ? item.points.pointsLosser : item.points.pointsWinner
      this.player.player1 = Object.assign({}, this.players.player1, players[0], {points: points1})
      this.player.match = item.key
      this.player.player2 = Object.assign({}, this.players.player2, players[1], {points: points2})
      this.setInfoModal = true
    },
    saveNewRecord () {
      this.$store.dispatch('setNewRecord', this.player)
      this.setRecordModal = false
    }
  },
  data () {
    return {
      active: null,
      keys: ['Todo', 'Done'],
      player: {
        valid: false,
        match: '',
        player1: {
          uid: '',
          name: '',
          points: 0
        },
        player2: {
          uid: '',
          name: '',
          points: 0
        },
        name: 'hola, como estas?, bien por acá',
        nameRules: [
          v => !!v || 'Points is required',
          v => v.length <= 2 || 'Name must be less than 2 characters'
        ]
      },
      setRecordModal: false,
      setInfoModal: false
    }
  }
}
</script>