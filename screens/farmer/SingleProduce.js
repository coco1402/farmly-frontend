import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Image, Pressable, Button, ScrollView, Platform} from "react-native";
import { getProduceById, updateProduceById } from "../../utils/api";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_BASE_URL } from "../../utils/api-config";

const SingleProduce = ({route, navigation}) =>{
    const [oneProduce, setOneProduce] = useState({})
    const {produce_id} = route.params
    const [isEditable, setIsEditable] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
    const [imageUri, setImageUri] = useState(null)

    useEffect(() => {
        if (!produce_id) {
            setIsLoading(false);
            return;
        }
        
        getProduceById(produce_id).then((response) => {
            // Response is an array, get the first item
            const produce = response[0] || {};
            setOneProduce(produce)
            setIsLoading(false)
        }).catch((err) => {
            //
            setIsLoading(false)
        })
    }, [produce_id])
    const produce = {...oneProduce}
    const [name, setName] = useState('')
    const [stock, setStock] = useState('')
    const [price, setPrice] = useState('')
    const [unit, setUnit] = useState('')
    const [description, setDescription] = useState('')
    const [pic, setPic] = useState('')
    const [category, setCategory] = useState('')
    const [originalData, setOriginalData] = useState({})

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
            throw error;
        }
    };

    const editProduce = () => {
        if (isEditable) {
            // Cancel - revert to original values
            setName(originalData.name || '');
            setStock(originalData.stock || '');
            setPrice(originalData.price || '');
            setUnit(originalData.unit || '');
            setDescription(originalData.description || '');
            setPic(originalData.produce_pic || '');
            setCategory(originalData.category || '');
            setImageUri(null);
            setIsEditable(false);
        } else {
            // Edit mode - store original values
            setOriginalData({
                name: name || oneProduce.name,
                stock: stock || oneProduce.stock,
                price: price || oneProduce.price,
                unit: unit || oneProduce.unit,
                description: description || oneProduce.description,
                produce_pic: pic || oneProduce.produce_pic,
                category: category || oneProduce.category
            });
            setIsEditable(true);
        }
    }

        const updateProduce = async () => {
            try {
                let imageUrl = pic || oneProduce.produce_pic;
                
                if (imageUri) {
                    const fullImageUrl = await uploadImage(imageUri);
                    imageUrl = `${API_BASE_URL.replace('/api', '')}${fullImageUrl}`;
                }

                const patch = {
                    "name": name || oneProduce.name,
                    "category": category || oneProduce.category,
                    "stock": stock || oneProduce.stock,
                    "price": price || oneProduce.price,
                    "unit": unit || oneProduce.unit,
                    "description": description || oneProduce.description,
                    "produce_pic": imageUrl
                }

                updateProduceById(produce_id, patch).then((response) => {
                    // Response is an array, get first item
                    setOneProduce(response[0] || response)
                    alert('Saved!')
                    setIsEditable(false)
                    setImageUri(null)
                }).catch((err) => {
                    //
                    alert("Sorry something went wrong, please try again later.")
                })
            } catch (error) {
                //
                alert("Failed to upload image. Please try again.");
            }
    }
        return isLoading ? (<View style={styles.container}><Text>Loading...</Text></View>)
        : oneProduce ? (
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
                    <View style={styles.card}>
                    <Text style={styles.text}>Name:</Text>
                    <TextInput style={styles.input} placeholder={oneProduce.name} value={name || oneProduce.name} editable={isEditable} onChangeText={name => setName(name)}/> 
                    <Text style={styles.text}>Stock:</Text>
                    <TextInput style={styles.input} placeholder={`${oneProduce.stock}`} value={stock || `${oneProduce.stock}`} editable={isEditable} onChangeText={stock => setStock(stock)}/> 
                    <Text style={styles.text}>Price:</Text>
                    <TextInput style={styles.input} placeholder={`${oneProduce.price}`} value={price || `${oneProduce.price}`} editable={isEditable} onChangeText={price => setPrice(price)}/> 
                    <Text style={styles.text}>Unit:</Text>
                    <TextInput style={styles.input} placeholder={oneProduce.unit} value={unit || oneProduce.unit} editable={isEditable} onChangeText={unit => setUnit(unit)}/> 
                    <Text style={styles.text}>Description:</Text>
                    <TextInput style={styles.input} placeholder={oneProduce.description} value={description || oneProduce.description} editable={isEditable} onChangeText={description => setDescription(description)}/> 
                    <Text style={styles.text}>Category:</Text>
                    <TextInput style={styles.input} placeholder={oneProduce.category} value={category || oneProduce.category} editable={isEditable} onChangeText={category => setCategory(category)}/> 
                    <Text style={styles.text}>Image:</Text>
                    <Image style={styles.pic} source={{uri: imageUri || pic || oneProduce.produce_pic}}/>
                    
                    {isEditable && (
                        <View style={styles.imageSection}>
                            <Pressable style={styles.imagePicker} onPress={pickImage}>
                                <Text style={styles.imagePickerText}>
                                    {imageUri ? "Change Image" : "Select New Image"}
                                </Text>
                            </Pressable>
                            
                            <Text style={styles.orText}>OR</Text>
                            
                            <TextInput 
                                style={styles.input} 
                                placeholder="Enter image URL" 
                                value={pic || oneProduce.produce_pic} 
                                editable={isEditable} 
                                onChangeText={(url) => {setPic(url); setImageUri(null);}}
                            />
                        </View>
                    )}
                    
                    <View style={styles.buttonContainer}>
                        <Button title={isEditable ? 'Cancel': 'Edit'} onPress={editProduce} />
                        {isEditable && <Button title="Save" onPress={updateProduce} />}
                        <Button title="Back" onPress={() => navigation.navigate("ProduceList")} />
                    </View>
                    </View>
            </View>
            </ScrollView>
        ) : (
            <View style={styles.container}>
                <Text>No produce data available</Text>
            </View>
        )
    }
    

export default SingleProduce

const styles= StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#B6EBA6'
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 50,
        paddingBottom: 50
    },
    container:{
        flex:1,
        alignItems:'center',
        justifyContent:'center'
    },
    card:{
        backgroundColor: "white",
        margin: 20,
        padding: 40,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    input:{
        margin: 10,
        borderBottomColor: "grey",
        borderBottomWidth: 0.5,
        padding: 10,
        fontSize: 16
    },
    pic:{
        marginTop: 10,
        alignSelf: "center",
        width:200,
        height: 150,
        borderRadius: 10
    },
    text: {
        paddingLeft: 10,
        fontWeight: "bold",
        fontSize: 16,
        color: "#333"
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20,
        gap: 10
    },
    imageSection: {
        marginVertical: 15,
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
    orText: {
        textAlign: "center",
        marginVertical: 10,
        color: "grey",
    }
})