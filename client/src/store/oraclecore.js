import { createSlice } from "@reduxjs/toolkit";

const oracleCoreSlice = createSlice({
  name: "oracleCore",
  initialState: {
    seasonsNumber: 0,
    seasons: [],
    defaultSeason: 2021,
    maxSeason: 2026,
    newSeason: 2021,
  },
  reducers: {
    loadSeasonsNumber(state, action) {
      state.seasonsNumber = action.payload.seasonsNumber;
    },
    loadSeasons(state, action) {
      state.seasons = action.payload.seasons;
      const lastSeason =
        state.seasons.length > 0
          ? state.seasons.reduce((s1, s2) => {
              return s1.id > s2.id ? s1 : s2;
            })
          : null;
      state.defaultSeason = lastSeason ? lastSeason.id : state.defaultSeason;

      state.defaultSeason++;
      state.newSeason = state.defaultSeason;
      state.maxSeason = state.defaultSeason + 5;
    },
    addSeason(state, action) {
      state.seasons.push({
        id: action.payload.id,
        state: "1",
      });
      console.log("add season ", state.defaultSeason);
      state.defaultSeason++;
      state.newSeason = state.defaultSeason;
      console.log("add season ", state.defaultSeason);
      console.log("add season ", state.newSeason);
      state.maxSeason = state.defaultSeason + 5;
      state.seasonsNumber = state.seasonsNumber + 1;
    },
    closeSeason(state, action) {
      for (let season of state.seasons) {
        if (season.id === action.payload.id) {
          season.state = "2";
          break;
        }
      }
    },
    encodeNewSeason(state, action) {
      state.newSeason = action.payload.newSeason;
    },
  },
});

export const oracleCoreActions = oracleCoreSlice.actions;

export default oracleCoreSlice;
