  import axios from "axios";
  import API_BASE_URL from './api-config';
  
  const farmlyApi = axios.create({
    baseURL: API_BASE_URL
  })

  const locationApi = axios.create({
    baseURL: 'https://api.postcodes.io'
  })

  export const getLocationData = (postcode) => {
    return locationApi.get(`/postcodes/${postcode}`)
    .then((res) => {
        return res
    })
  }

  export const patchFarmDistanceById = (farm_id, body) => {
  return farmlyApi.patch(`/farms/${farm_id}`, {distance_from_location: body})
  .then((res) => {
    return res.data
  })
}
  export const getFarms = () => {
    return farmlyApi.get("/farms")
    .then((response)=>{
        return response.data
    })
  };

  export const postFarm = (newFarm) =>{
  return farmlyApi.post(`/farms`, newFarm)
  .then((response)=>{
    return response.data
  })
}

  
  export const getFarmById = (farm_id)=>{
    return farmlyApi.get(`/farms/${farm_id}`)
    .then((response)=>{
      return response.data
    })
  };

   export const patchFarmById = (farm_id, updateBody) => {
    return farmlyApi.patch(`/farms/${farm_id}`, updateBody)
    .then((response) => {
      return response.data
    })
  }



  export const getProduce = () =>{
    return farmlyApi.get('/produce')
    .then((response)=>{
      return response.data
    })
  }

  export const getUsers = () => {
    return farmlyApi.get("/users")
    .then((res) => {
      return res.data
    })
  }

  export const postProduce = (newProduce) =>{
    return farmlyApi.post('/produce', newProduce)
    .then((response)=>{
      return response.data
    })
  }

  export const deleteProduce = (produce_id) => {
    return farmlyApi.delete(`/produce/${produce_id}`)
    .then((response) => {
      return response.data
    })
  }


  export const getProduceById = (produce_id) =>{
    return farmlyApi.get(`/produce/${produce_id}`)
    .then((response)=>{
      return response.data
    })
  }

  export const updateProduceById = (produce_id, updateBody) => {
    return farmlyApi.patch(`/produce/${produce_id}`, updateBody)
    .then((response) => {
      return response.data
    })
  }
    
  export const postUser = (newUser) => {
    return farmlyApi.post('/users', newUser)
    .then((response)=>{
      return response.data
    })
  }

  export const updateUserById = (user_id, updateBody) => {
    return farmlyApi.patch(`/users/${user_id}`, updateBody)
    .then((response) => {
      return response.data
    })
  }
