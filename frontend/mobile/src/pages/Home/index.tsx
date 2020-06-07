import React , {useState, useEffect} from 'react';
import { View, ImageBackground, Image , StyleSheet, Text, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

import api from '../../services/api';

interface UF {
  sigla: string;
}

interface Municipio {
  nome: string;
}

interface PickerSelect{
  label:string;
  value:string;
}

const Home = () => {

    const navigation = useNavigation();

    const [ufs, setUfs] = useState<PickerSelect[]>([]);

    useEffect(() => {
      api.get<UF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then( response => {
            const ufInitials = response.data.map(uf => {
              return {
                label: uf.sigla,
                value: uf.sigla
              }              
            });
            setUfs(ufInitials);   
            setMunicipios([]);
            });
    }, []);

    const [selectedUF, setSelectedUF] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [municipios, setMunicipios] = useState<PickerSelect[]>([]);
    useEffect(() => {
      api.get<Municipio[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
        .then( response => {
            const municipios = response.data.map(municipio => {
              return {
                  label:municipio.nome,
                  value: municipio.nome
              }
            });
            setMunicipios(municipios);
            });
    }, [selectedUF]); //Carregar as Cidades sempre que a UF alterar



    function handleNavigateToPoints(){
      if (!selectedCity)
      {
        Alert.alert('Info','Selecione um município');
        return;
      }
        navigation.navigate('Points', {
          uf: selectedUF,
          city: selectedCity
        });
    }

  function handleSelectUF(value: any){
      const uf = value;
      setMunicipios([]);
      setSelectedUF(uf);

  }

  function handleSelectCity(value: any){
      const city = value;
      setSelectedCity(city);
  }
  const placeholderUF = {
    label: 'Selecione o UF',
    value: null,
    color: '#9EA0A4',
  }
  const placeholderCity = {
    label: 'Selecione o Município',
    value: null,
    color: '#9EA0A4',
  }

    return (
       <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios'? 'padding' : undefined}>
        <ImageBackground source={require('../../assets/home-background.png')}
          style={styles.container}
          imageStyle={{ width: 274, height: 368 }}
        >
          <View style={styles.main} >
            <Image source={require('../../assets/logo.png')} />
            <View>
              <Text style={styles.title}> Seu marketplace de coleta de resíduos</Text>
              <Text style={styles.description}>Ajudamos pessoas a encotrarem pontos de coleta de forma eficiente</Text>
            </View>
          </View>

          <View style={styles.footer}>
          <RNPickerSelect
              placeholder={placeholderUF}
              onValueChange={(value) => handleSelectUF(value)}
              items={ufs}
            />
            <RNPickerSelect
              placeholder={placeholderCity}
              style={{
                iconContainer: {
                  top: 5,
                  right: 15,
                },
              }}                          
              onValueChange={(value) => handleSelectCity(value)}
              items={municipios}
            />

            <RectButton style={styles.button} onPress={handleNavigateToPoints}>
              <View style={styles.buttonIcon}>
                <Text>
                  <Icon name="arrow-right" color="#FFF" size={24} />
                </Text>
              </View>
              <Text style={styles.buttonText}>
                Entrar
                    </Text>
            </RectButton>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
} 

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
  });

export default Home;