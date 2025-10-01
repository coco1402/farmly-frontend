import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TextInput, Button, Pressable, ScrollView, Platform } from "react-native";
import { getFarms, patchFarmById, getUsers, postFarm  } from "../../utils/api";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_BASE_URL } from "../../utils/api-config";

import { UserContext } from "../../navigation/user";

const MyFarm = ({navigation}) => {
    const {user, isFirstLaunch} = useContext(UserContext)
    const [farm, setFarm ] = useState([]);
    const [isLoading, setIsLoading] = useState(true)
    const [shouldShow, setShouldShow] = useState(false);
    const [newFarmName, setNewFarmName] = useState("");
    const [profile_pic, setProfilePic] = useState("");
    const [description, setDescription] = useState("");
    const [street, setStreet] = useState("")
    const [town, setTown] = useState('')
    const [county, setCounty] = useState('')
    const [postcode, setPostcode] = useState('')
    const [country, setCountry] = useState('')
    const [isEditable, setIsEditable] = useState(false);
    const [name, setName] = useState('')
    const [newDescription, setNewDescription] = useState('')
    const [farmAdded, setFarmAdded] = useState(false)
    const [imageUri, setImageUri] = useState(null)
    const [originalName, setOriginalName] = useState('')
    const [originalDescription, setOriginalDescription] = useState('')

  useEffect(() => {
    if (isFirstLaunch === true) {
      // First launch: get all farms
      getFarms()
        .then((response) => {
          setFarm(response);
          setIsLoading(false);
        })
        .catch((err) => {
          //
          setIsLoading(false);
        });
    } else {
      // Regular launch: get user's farms only
      getFarms()
        .then((response) => {
          const listOfFarms = [...response];
          const myFarm = listOfFarms.filter((farm) => {
            return farm.username === user.email;
          });
          setFarm(myFarm);
          setIsLoading(false);
        })
        .catch((err) => {
          //
          setIsLoading(false);
        });
    }
  }, [user.email, isFirstLaunch]); // Fixed dependencies


  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const formData = new FormData();
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      const photo = {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        type: `image/${fileType}`,
        name: `photo_${Date.now()}.${fileType}`,
      };
      
      formData.append('image', photo);

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.imageUrl;
    } catch (error) {
      //
      //
      throw error;
    }
  };

  const addFarm = async () => {
      setShouldShow(!shouldShow);

      try {
        let imageUrl = profile_pic;
        if (imageUri) {
          const fullImageUrl = await uploadImage(imageUri);
          imageUrl = `${API_BASE_URL.replace('/api', '')}${fullImageUrl}`;
        }

        const newFarm = {
          name: newFarmName,
          description: description,
          address: {street:street, town: town, county: county, postcode: postcode, country: country},
          profile_pic: imageUrl,
          user_id: 0,
          username: user.email,
          distance_from_location: 0,
        };

        postFarm(newFarm).then((response) => {
            // Update farm with the response from server (includes _id)
            setFarm([response]);
            setFarmAdded(true);
            alert('Farm added successfully!');
        })
        .catch((err) => {
          //
          //
          alert(`Error adding farm: ${err.response?.data?.message || err.message || "Unknown error"}`);
        });
      } catch (error) {
        //
        alert("Failed to upload image. Please try again.");
      }
    };

  if (isFirstLaunch == true) {
    return farmAdded===false ? (
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
        <Pressable
          style={styles.add}
          onPress={() => setShouldShow(!shouldShow)}
        >
          <Text style={styles.content}>{shouldShow ? '-' : '+'}</Text>
        </Pressable>
        {shouldShow ? (
          <View style={styles.addFarm}>
            <Text>Farm Name:</Text>
            <TextInput
              style={styles.textinput}
              placeholder="Enter farm name"
              onChangeText={(newFarmName) => setNewFarmName(newFarmName)}
            />

            <Text>Street:</Text>
            <TextInput
              style={styles.textinput}
              placeholder="Enter street"
              onChangeText={(street) => setStreet(street)}
            />

            <Text>Town:</Text>
            <TextInput
              style={styles.textinput}
              placeholder="Enter town"
              onChangeText={(town) => setTown(town)}
            />

            <Text>County:</Text>
            <TextInput
              style={styles.textinput}
              placeholder="Enter county"
              onChangeText={(county) => setCounty(county)}
            />

            <Text>Postcode:</Text>
            <TextInput
              style={styles.textinput}
              placeholder="Enter postcode"
              onChangeText={(postcode) => setPostcode(postcode)}
            />

            <Text>Country:</Text>
            <TextInput
              style={styles.textinput}
              placeholder="Enter country"
              onChangeText={(country) => setCountry(country)}
            />


            <Text>Description:</Text>
            <TextInput
              style={styles.textinput}
              placeholder="Provide a description of your farm"
              onChangeText={(description) => setDescription(description)}
            />

            <Text>Farm image:</Text>
            <View style={styles.imageSection}>
              <Pressable style={styles.imagePicker} onPress={pickImage}>
                <Text style={styles.imagePickerText}>
                  {imageUri ? "Change Image" : "Select Image"}
                </Text>
              </Pressable>
              
              {imageUri && (
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.previewImage} 
                />
              )}
              
              <Text style={styles.orText}>OR</Text>
              
              <TextInput
                style={styles.textinput}
                placeholder="Enter image URL"
                value={profile_pic}
                onChangeText={(url) => {setProfilePic(url); setImageUri(null);}}
              />
            </View>


            <Pressable style={styles.add} onPress={() => addFarm()}>
              <Text style={styles.content}>Add Farm</Text>
            </Pressable>
          </View>
        ) : null}
        </View>
      </ScrollView>
    ) : farm && farm.length > 0 && farm[0] ? (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
        <Image
          source={{ uri: `${farm[0].profile_pic}` }}
          style={{ width: 400, height: 200 }}
        />
        <Text style={styles.text}>{farm[0].name}</Text>
        <Text style={styles.text}>{farm[0].address.street}</Text>
        <Text style={styles.text}>{farm[0].address.town}</Text>
        <Text style={styles.text}>{farm[0].address.county}</Text>
        <Text style={styles.text}>{farm[0].address.postcode}</Text>
        <Text style={styles.text}>{farm[0].address.country}</Text>
        <Text style={styles.text}>{farm[0].description}</Text>
          </View>
        </ScrollView>
    ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <Text>No farm data available</Text>
          </View>
        </ScrollView>
    )
    } else {
    const editFarm = () => {
        if (isEditable) {
            // Currently editing - this is cancel
            setName(originalName);
            setNewDescription(originalDescription);
            setIsEditable(false);
        } else {
            // Entering edit mode - store original values
            setOriginalName(name || farm[0].name);
            setOriginalDescription(newDescription || farm[0].description);
            setIsEditable(true);
        }
    }

        const updateFarm = () => {
            const patch = {
                "name": name || farm[0].name,
                "description": newDescription || farm[0].description
            }
            patchFarmById(farm[0]._id, patch)      
            .then(() => {
                alert('Saved!')
                setIsEditable(!isEditable)
                // Update the local state to reflect changes
                setFarm([{...farm[0], ...patch}])
            }).catch((err) => {
                //
                //
                alert("Something went wrong, please try again")
            })
            
    }

    if(isFirstLaunch == true){
        return (
            <View style={styles.container}>
                <Text>Welcome to Farmly!</Text>
            </View>
        )
    }
    else {
        return isLoading ? (
            <View style={styles.container}>
                <Text> Loading... </Text>
            </View>
      ) : farm && farm.length > 0 && farm[0] ? (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
                <Image source={{uri:`${farm[0].profile_pic}`}}
                style={{width: 400, height: 200}}/>
                <TextInput style={styles.input} placeholder={farm[0].name} value={name || farm[0].name} editable={isEditable} onChangeText={name => setName(name)} />
                <Text style={styles.text}>{farm[0].address.street}</Text>
                <Text style={styles.text}>{farm[0].address.town}</Text>
                <Text style={styles.text}>{farm[0].address.county}</Text>
                <Text style={styles.text}>{farm[0].address.postcode}</Text>
                <Text style={styles.text}>{farm[0].address.country}</Text>
                <TextInput multiline={true} numberOfLines={3} style={styles.textinput} placeholder={farm[0].description} value={newDescription || farm[0].description} editable={isEditable} onChangeText={description => setNewDescription(description)} />
                <Button title={isEditable ? 'Cancel': 'Edit'} onPress={editFarm} />
                    {isEditable ? (<Button title="Save" onPress={updateFarm} />) :null }
          </View>
        </ScrollView>
       ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <Pressable
              style={styles.add}
              onPress={() => setShouldShow(!shouldShow)}
            >
              <Text style={styles.content}>{shouldShow ? '-' : '+'}</Text>
            </Pressable>
            {shouldShow ? (
              <View style={styles.addFarm}>
                <Text>Farm Name:</Text>
                <TextInput
                  style={styles.textinput}
                  placeholder="Enter farm name"
                  onChangeText={(newFarmName) => setNewFarmName(newFarmName)}
                />

                <Text>Street:</Text>
                <TextInput
                  style={styles.textinput}
                  placeholder="Enter street"
                  onChangeText={(street) => setStreet(street)}
                />

                <Text>Town:</Text>
                <TextInput
                  style={styles.textinput}
                  placeholder="Enter town"
                  onChangeText={(town) => setTown(town)}
                />

                <Text>County:</Text>
                <TextInput
                  style={styles.textinput}
                  placeholder="Enter county"
                  onChangeText={(county) => setCounty(county)}
                />

                <Text>Postcode:</Text>
                <TextInput
                  style={styles.textinput}
                  placeholder="Enter postcode"
                  onChangeText={(postcode) => setPostcode(postcode)}
                />

                <Text>Country:</Text>
                <TextInput
                  style={styles.textinput}
                  placeholder="Enter country"
                  onChangeText={(country) => setCountry(country)}
                />

                <Text>Description:</Text>
                <TextInput
                  style={styles.textinput}
                  placeholder="Provide a description of your farm"
                  onChangeText={(description) => setDescription(description)}
                />

                <Text>Farm image:</Text>
                <View style={styles.imageSection}>
                  <Pressable style={styles.imagePicker} onPress={pickImage}>
                    <Text style={styles.imagePickerText}>
                      {imageUri ? "Change Image" : "Select Image"}
                    </Text>
                  </Pressable>
                  
                  {imageUri && (
                    <Image 
                      source={{ uri: imageUri }} 
                      style={styles.previewImage} 
                    />
                  )}
                  
                  <Text style={styles.orText}>OR</Text>
                  
                  <TextInput
                    style={styles.textinput}
                    placeholder="Enter image URL"
                    value={profile_pic}
                    onChangeText={(url) => {setProfilePic(url); setImageUri(null);}}
                  />
                </View>

                <Pressable style={styles.add} onPress={() => addFarm()}>
                  <Text style={styles.content}>Add Farm</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </ScrollView>
       )

    }
}
}

export default MyFarm;

const styles= StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#B6EBA6'
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 50
  },
  container: {
    padding: 60,
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  input:{
    margin: 10,
    borderBottomColor: "solid grey",
    borderBottomWidth: 0.5,
    padding: 10,

    fontSize:25,
    fontStyle:'italic'

  },
  add:{
    backgroundColor: "#4d9900",
    padding: 10,
    borderRadius: 5,
    marginTop:20
  },
  text:{
    borderBottomColor: "solid grey",
    borderBottomWidth: 0.5,
    fontSize:15,
  },
  textinput:{
    borderBottomColor: "grey",
    borderBottomWidth: 1,
    marginBottom: 20,
    marginTop: 5
  },
  content: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center"
  },
  addFarm:{
    backgroundColor: "white",
    padding: 40,
    marginTop:20,
    borderRadius: 20,
    width: '100%'
  },
  imageSection: {
    marginBottom: 20,
  },
  imagePicker: {
    backgroundColor: "#4d9900",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 5,
  },
  imagePickerText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  previewImage: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 10,
    borderRadius: 10,
  },
  orText: {
    textAlign: "center",
    marginVertical: 10,
    color: "grey",
  }
})


