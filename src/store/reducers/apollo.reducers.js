export function ui(state = {}, action) {
  switch (action.type) {
    case 'SET_ACTIVE_SECTION_ID':
      return {
        ...state,
        activeSectionId: action.id
      }
    case 'SET_ACTIVE_CAMPAIGN_ID':
      return {
        ...state,
        activeCampaignId: action.id
      }
    default:
      return state
  }
}

export function user(state = null, action) {
  switch(action.type) {
    case 'SET_CURRENT_USER':
      return action.user
    default:
      return state
  }
}
