import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState, useContext } from "react";
import { getFarms, getProduce } from "../../utils/api";
import { FlatList } from "react-native";
import { UserContext } from "../../navigation/user";

const SingleFarm = ({ route, navigation }) => {
  const { farm_id } = route.params;
  const [farm, setFarm] = useState(null);
  const [produce, setProduce] = useState([]);
  const { user } = useContext(UserContext);

  const isGuest = user?.email === "guest@farmly.com";

  useEffect(() => {
    if (!farm_id) {
      console.log("No farm_id provided");
      return;
    }

    console.log("Fetching farm with ID:", farm_id);

    // Workaround: Get all farms and filter by ID since /farms/:id endpoint is broken
    getFarms().then((farms) => {
      const foundFarm = farms.find(f => f._id === farm_id);
      if (foundFarm) {
        console.log("Farm data received:", foundFarm);
        setFarm(foundFarm);
      } else {
        console.error("Farm not found with ID:", farm_id);
        alert("Farm not found");
      }
    }).catch((error) => {
      console.error("Error fetching farms:", error.response?.data || error.message);
      alert(`Failed to load farm: ${error.response?.data?.msg || error.message}`);
    });

    getProduce().then((response) => {
      console.log("Produce data received:", response);
      setProduce(response);
    }).catch((error) => {
      console.error("Error fetching produce:", error.response?.data || error.message);
    });
  }, [farm_id]);

  const produceInStock = produce.filter((item) => {
    return item.farm_id === farm_id;
  });

  if (farm) {
    return (
      <View style={styles.container}>
        {/* Back button floating on top */}
        <TouchableOpacity style={styles.backButton} onPress={() => {navigation.navigate("FarmList");}}>
          <Text style={styles.baseText}>← Back</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Farm info card */}
          <View style={styles.farmInfo}>
            <Image source={{ uri: `${farm.profile_pic}` }} style={styles.cardImage}/>

            <View style={styles.contentContainer}>
              <Text style={styles.titleText}>{farm.name}</Text>

              <Text style={styles.subTitle}>📍 Address</Text>
              <Text style={styles.address}>
                {farm.address.street}{'\n'}
                {farm.address.town}, {farm.address.county}{'\n'}
                {farm.address.postcode}, {farm.address.country}
              </Text>

              <Text style={styles.subTitle}>ℹ️ About this farm</Text>
              <Text style={styles.description}>{farm.description}</Text>

              {/* Custom message button - hidden for guest users */}
              {!isGuest && (
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={() =>
                    navigation.navigate("UserChat", {
                      farm_id: farm_id,
                      farm_name: farm.name,
                      farm_username : farm.username
                    })
                  }
                >
                  <Text style={styles.messageButtonText}>💬 Message the farm</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Produce section */}
          {produceInStock.length > 0 && (
            <View style={styles.produceSection}>
              <Text style={styles.produceHeader}>🥬 Fresh Produce Available</Text>
              {produceInStock.map((item) => (
                <View style={styles.produceCard} key={item._id || item.name}>
                  <Image source={{ uri: `${item.produce_pic}` }} style={styles.produceImage}/>
                  <View style={styles.produceWriting}>
                    <Text style={styles.produceSubTitle}>{item.name}</Text>
                    <Text style={styles.producePriceText}>
                      £{item.price} per {item.unit}
                    </Text>
                    <Text style={styles.produceDescriptionText}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  } else {
    // Loading state
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => {navigation.navigate("FarmList");}}>
          <Text style={styles.baseText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading farm details...</Text>
        </View>
      </View>
    );
  }
};

export default SingleFarm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    alignItems: 'center',
  },
  contentContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 40,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    cursor: 'pointer',
  },
  baseText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  address: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'left',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  subTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2d5a27',
    marginTop: 32,
    marginBottom: 8,
    textAlign: 'left',
    paddingHorizontal: 40,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'left',
    paddingHorizontal: 40,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2d5a27',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  farmInfo: {
    backgroundColor: "white",
    width: '100%',
    maxWidth: 1200,
    marginTop: 0,
    borderRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingBottom: 40,
  },
  cardImage: {
    width: '100%',
    height: 500,
    resizeMode: 'cover',
  },
  produceSection: {
    width: '100%',
    maxWidth: 1200,
    paddingHorizontal: 40,
  },
  produceCard: {
    backgroundColor: "white",
    marginVertical: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  produceWriting: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  produceImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    margin: 20,
    resizeMode: 'cover',
  },
  produceSubTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2d5a27',
    marginBottom: 8,
  },
  producePriceText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4a90e2',
    marginBottom: 8,
  },
  produceDescriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  produceHeader: {
    fontSize: 32,
    fontWeight: '600',
    color: '#2d5a27',
    textAlign: 'center',
    marginTop: 48,
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
  messageButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginHorizontal: 40,
    marginTop: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'flex-start',
    cursor: 'pointer',
  },
  messageButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
