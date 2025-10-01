import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState, useContext } from "react";
import { getFarmById, getProduce } from "../../utils/api";
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
      return;
    }

    getFarmById(farm_id).then((response) => {
      setFarm(response);
    }).catch((error) => {
      //
    });
    getProduce().then((response) => {
      setProduce(response);
    }).catch((error) => {
      //
    });
  }, []);
  
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
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Farm info card */}
          <View style={styles.farmInfo}>
            <Image source={{ uri: `${farm.profile_pic}` }} style={styles.cardImage}/>
            
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
          
          {/* Produce section */}
          {produceInStock.length > 0 && (
            <>
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
            </>
          )}
          
          {/* Bottom spacing */}
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    );
  } else {
    // Loading state
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => {navigation.navigate("FarmList");}}>
          <Text style={styles.baseText}>Back</Text>
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
  button: {
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  baseText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  address: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    textAlign: 'left',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d5a27',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    textAlign: 'left',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d5a27',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  farmInfo: {
    backgroundColor: "white",
    marginTop: 0,
    borderRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingBottom: 24,
  },
  cardImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  produceCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  produceWriting: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  produceImage: {
    width: 80, 
    height: 80,
    borderRadius: 12,
    margin: 16,
    resizeMode: 'cover',
  },
  produceSubTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5a27',
    marginBottom: 8,
  },
  producePriceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4a90e2',
    marginBottom: 8,
  },
  produceDescriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  produceHeader: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2d5a27',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  messageButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  messageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
