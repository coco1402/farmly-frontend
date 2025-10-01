import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Button, TextInput, Pressable, ScrollView, Image, Platform } from "react-native";
import RadioForm from 'react-native-simple-radio-button';
import { Card } from "react-native-elements";
import { deleteProduce, getFarms, getProduce, postProduce } from "../../utils/api";
import { UserContext } from "../../navigation/user";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_BASE_URL } from "../../utils/api-config";

const ProduceList = ({ navigation }) => {
  const {user} = useContext(UserContext)
  const [farms, setFarms] = useState([])
  const [produce, setProduce] = useState([]);
  const [shouldShow, setShouldShow] = useState(false)
  const [category, setCategory] = useState('fruits');
  const [name, setName] = useState('')
  const [stock, setStock] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('')
  const [description, setDescription] = useState('')
  const [pic, setPic] = useState('')
  const [imageUri, setImageUri] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const categories = [
    { label: 'fruits', value: 'fruits' },
    { label: 'vegetables', value: 'vegetables' },
    { label: 'condiments', value: 'condiments' }
  ]; 

  useEffect(() => {
    getProduce().then((response) => {
      setProduce(response);
      setIsLoading(false)
    }).catch((err) => {
      setIsLoading(false);
    });

    getFarms().then((response) => {
      setFarms(response)
    }).catch((err) => {
      // Error getting farms
    })
  }, []);

  const listOfFarms = [...farms]

  const currFarm = listOfFarms.filter((farm) => {
    return farm.username === user.email
  })

  const listOfProduce = [...produce]
  const myProduce = listOfProduce.filter((produce) => {
    return user.email === produce.username
  })

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Pick image
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,  
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);

      // Optional: Check file size if available
      if (result.assets[0].fileSize) {
        const sizeMB = result.assets[0].fileSize / (1024 * 1024);
        if (sizeMB > 10) {
          alert('Image is too large. Please select a smaller image or use the edit option to crop it.');
          setImageUri(null);
          return;
        }
      }
    }
  };

  const uploadImage = async (uri) => {
    try {
      // Create form data
      const formData = new FormData();

      // Get the file extension
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      // Prepare the file object
      const photo = {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        type: `image/${fileType}`,
        name: `photo_${Date.now()}.${fileType}`,
      };

      formData.append('image', photo);

      // Upload to server
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.imageUrl;
    } catch (error) {
      throw error;
    }
  };

  const addProduce = async () => {
    if (!currFarm || currFarm.length === 0) {
      alert("Please create a farm first before adding produce.");
      return;
    }

    try {
      // Upload image if one is selected
      let imageUrl = pic; // Default to URL if no image selected
      if (imageUri) {
        const fullImageUrl = await uploadImage(imageUri);
        imageUrl = `${API_BASE_URL.replace('/api', '')}${fullImageUrl}`;
      }

      const newProduce = {
          "name": name,
          "category": category,
          "stock": stock,
          "price": price,
          "unit": unit,
          "description": description,
          "farm_id": currFarm[0]._id,  // Changed from farm_id to _id
          "username": user.email,
          "produce_pic": imageUrl
      }

    //optimistic rendering:
    setProduce((produceList) => {
      const newProduceList = [...produceList]
      newProduceList.push(newProduce)
      return newProduceList
    })

    postProduce(newProduce)
    .then((response) => {
      // Clear form fields
      setName('');
      setStock('');
      setPrice('');
      setUnit('');
      setDescription('');
      setPic('');
      setImageUri(null);
      setCategory('fruits');
      setShouldShow(false)
    })
    .catch((err) => {
      alert("sorry something went wrong, please try again later.")
      setProduce((produceList) => {
        const newProduceList = [...produceList]
        newProduceList.pop()
        return newProduceList
      })
    })
    } catch (error) {
      alert("Failed to upload image. Please try again.");
    }
  }

  const handleDelete = (id) => {
    const newProduceList = [...produce]

    // Optimistically remove the item from UI
    setProduce(() => {
      return newProduceList.filter((produce) => {
        return produce._id !== id
      })
    })

    // Call API to delete from backend
    deleteProduce(id)
    .then((response) => {
      // Delete successful
    })
    .catch((err) => {
      alert("Sorry something went wrong, please try again later.")
      // Restore the list on failure
      setProduce(newProduceList)
    })
  }

    return isLoading ? (
      <View style={styles.container}>
        <Text> Loading... </Text>
      </View>
    )
    :
    (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
      <Pressable style={styles.add} onPress={()=> setShouldShow(!shouldShow)}>
      <Text style={styles.content}>{shouldShow ? '-' : '+'}</Text>
      </Pressable>

      {shouldShow ?
        ( <View style={styles.addProduce}>
          <Text>Name:</Text>
          <TextInput 
          style={styles.input}
          placeholder="e.g peas" 
          onChangeText={name => setName(name)}/>
          
          <Text>Stock:</Text>
          <TextInput
          style={styles.input}
          placeholder="e.g 10"
          onChangeText={stock => setStock(stock)}                                     
          />

          <Text>Price(£):</Text>
          <TextInput
          style={styles.input}
          placeholder="e.g 2.50" 
          onChangeText={price => setPrice(price)}
          />

          <Text>Unit:</Text>
          <TextInput
          style={styles.input}
          placeholder="e.g 300g" 
          onChangeText={unit => setUnit(unit)}
          />  

          <Text>Description:</Text>
          <TextInput
          style={styles.input}
          placeholder="description"
          onChangeText={description => setDescription(description)}
          />

          <Text>Image:</Text>
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
              style={styles.input}
              placeholder="Enter image URL"
              value={pic}
              onChangeText={pic => {setPic(pic); setImageUri(null);}}
            />
          </View>

          <Text>Category:</Text>
          <RadioForm style={styles.radio}
          radio_props={categories}
          initial={0}
          onPress={(value) => {
            setCategory(value);
          }}
          />

          <Pressable style={styles.add} onPress={()=> addProduce()}>
          <Text style={styles.content}>Add Produce</Text>
          </Pressable>

        </View>)
      : null }

      <FlatList
        data={myProduce}
        renderItem={({ item }) => {
          return (
            <Card>
              <Text style={styles.textName} onPress={() => navigation.navigate("SingleProduce", {produce_id: item._id})}>{item.name}</Text>
              <Text style={styles.text}>Stock: {item.stock}</Text>
              <Image style={styles.pic} source={{uri:`${item.produce_pic}`}}/>
              <Pressable style={styles.button} onPress={()=> handleDelete(item._id)}>
              <Text style={styles.deltext}>🗑️</Text>               
              </Pressable>
            </Card>
          );
        }}
      />
      </View>
    </ScrollView>
  );
};

export default ProduceList;

const styles = StyleSheet.create({
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  button:{
    backgroundColor: "none",
  },
  deltext: {
    textAlign: "center",
    marginTop: 20,
    padding: 0,
  },
  text: {
    textAlign: "center"
  },
  textName: {
    textAlign: "center",
    fontWeight: "bold"
  },
  add:{
    backgroundColor: "#4d9900",
    padding: 10,
    borderRadius: 5,
  },
  pic:{
    alignSelf: "center",
    width:100,
    height: 60
},
addProduce:{
  backgroundColor: "white",
  padding: 40,
  marginTop: 20,
  borderRadius: 20,
  width: '100%'
},
input:{
  borderBottomColor: "grey",
  borderBottomWidth: 1,
  marginBottom: 20,
  marginTop: 5
},
radio: {
  paddingBottom: 20
},
content: {
  color: "white",
  fontWeight: "bold",
  fontSize: 16,
  textAlign: "center"
},
imageSection: {
  marginBottom: 20,
},
imagePicker: {
  backgroundColor: "#4d9900",
  padding: 10,
  borderRadius: 5,
  marginBottom: 10,
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
});