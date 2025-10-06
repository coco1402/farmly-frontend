import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { getFarms, patchFarmDistanceById } from "../../utils/api";
import * as Location from 'expo-location';
import { distanceCalculator } from "../../utils/distanceCalculator";

const FarmList = ({ navigation }) => {
  const [farms, setFarms] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [permission, setPermission] = useState(false)

  useEffect(() => {

    const getPermissions = async () => {
      setLoading(true)
      let {status} = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setLoading(false)
        setPermission(false)
      } else {
        setPermission(true)
        let location = await Location.getCurrentPositionAsync({})
        setCurrentLocation(location)
      }
      return status
    }

    const getFarmsDistance = async () => {
      getFarms()
      .then((response) => {
        setFarms(response)
      })
      .then(() => {
          farms.forEach((farm) => {
              distanceCalculator(currentLocation.coords.latitude, currentLocation.coords.longitude, farm.address.postcode)
              .then((res) => {
                patchFarmDistanceById(farm._id, res)
              })
          })
      })
    }

    getPermissions()
    .then(() => {
      getFarmsDistance()
      setLoading(false)
    })

  }, []);


  if (loading) {
    return (
      <View style={styles.listCard}>
        <Text>Calculating your closest farms...</Text>
      </View>
    )
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.listCard}>
          <Text style={styles.topCard}>
            Check out some nearby farms!
          </Text>
        </View>
        <FlatList
          data={farms}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity style={styles.card} onPress={() => {
                navigation.navigate("SingleFarm", {farm_id: item._id});
              }}>
                  <Image
                  style={styles.cardImage}
                  source={{uri: item.profile_pic}}
                  />
                <Text
                style={styles.baseText} >
                  <Text
                  style={styles.titleText}>
                    {item.name}
                  </Text>
                </Text>
              </TouchableOpacity>
            );
          }}
        />
    </View>
    )
  }

  return (
      <View style={styles.container}>
        <View style={styles.listCard}>
          <Text style={styles.topCard}>
            Check out some nearby farms!
          </Text>
        </View>
        <FlatList
          data={farms}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity style={styles.card} onPress={() => {
                navigation.navigate("SingleFarm", {farm_id: item._id});
              }}>
                  <Image
                  style={styles.cardImage}
                  source={{uri: item.profile_pic}}
                  />
                <Text
                style={styles.baseText} >
                  <Text
                  style={styles.titleText}>
                    {item.name}
                  </Text>
                  {`\n`}
                  {item.distance_from_location} km away
                </Text>
              </TouchableOpacity>
            );
          }}
        />
    </View>
  );
};

export default FarmList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#f5f5f5',
  },
  listContainer: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  card: {
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "white",
    marginVertical: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "black",
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 600,
    resizeMode: 'cover',
  },
  baseText: {
    fontSize: 16,
    textAlign: "center",
    padding: 16,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    padding: 8
  },
  listCard: {
      marginHorizontal: 20,
      marginTop: 64,
      marginBottom: 24,
      backgroundColor: "white",
      alignItems: "center",
      borderRadius: 12,
      shadowColor: "black",
      shadowOffset: {width: 2, height: 2},
      shadowOpacity: 0.5,
      shadowRadius: 5,
      padding: 20
  },
  topCard: {
    padding: 4,
    fontSize: 28,
    fontWeight: "bold",
    margin: 0
  }
});
