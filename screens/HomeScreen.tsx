import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline'
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid'
import { StatusBar } from 'expo-status-bar'
import { Image } from 'react-native';
import { theme } from '../theme/index'
import { debounce } from 'lodash'
import { fetchLocations, fetchWeatherForecast } from '../api/weather'
import { weatherImages } from '../constants';

interface infoLoc {
  name: string,
  region: string,
  country: string,
  lat: number,
  lon: number,
  tz_id: string,
  localtime_epoch: number,
  localtime: string,
};

interface currentType {
  last_updated_epoch: number,
  last_updated: number,
  temp_c: number,
  temp_f: number,
  is_day: number,
  condition: string | number
}

interface WeatherType {
  current: currentType;
  location: infoLoc
}


const HomeScreen: React.FC = () => {
  const [showSearch, toggleSearch] = useState(false)
  const [locations, setLocations] = useState<infoLoc[]>([])
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<{ [key: string]: any }>({})


  const handleLocation = (loc: infoLoc) => {
    console.log('location: ', loc)
    setLocations([])
    toggleSearch(false)
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then(data => {
      setWeather(data)
      console.log('got forecast: ', data)
    })
  }

  const handleSearch = (value: string) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data: any) => {
        setLocations(data)
        console.log(data)
      })
    }
  }

  useEffect(()=>{
    fetchMyWeatherData();
  },[]);

  const fetchMyWeatherData = async ()=>{
    let cityName = 'Porto Alegre';
    fetchWeatherForecast({
      cityName,
      days: '7'
    }).then(data=>{
      // console.log('got data: ',data.forecast.forecastday);
      setWeather(data);
      setLoading(false);
    })
   }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])

  const { current, location } = weather;

  return (
    <View className='flex-1 relative'>
      <StatusBar style='light' />
      <Image blurRadius={70} source={require('../assets/images/bg.png')}
        className='absolute h-full w-full'
      />
      <SafeAreaView className='flex flex-1'>
        {/* Search section */}
        <View style={{ height: '7%' }} className='mx-4 relative z-50 mt-4'>
          <View className='flex-row justify-end items-center rounded-full'
            style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }}>
            {
              showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder='Search City'
                  placeholderTextColor={'lightgray'}
                  className='pl-6 h-10 pb-1 flex-1 text-base  text-white'
                />
              ) : null
            }

            <TouchableOpacity
              onPress={() => toggleSearch(!showSearch)}
              style={{ backgroundColor: theme.bgWhite(0.3) }}
              className='rounded-full p-3 m-1'
            >
              <MagnifyingGlassIcon size='25' color='white' />
            </TouchableOpacity>
          </View>
          {
            locations.length > 0 && showSearch ? (
              <View className='absolute w-full bg-gray-300 top-16 rounded-3xl'>
                {
                  locations.map((loc, index) => {
                    let showBorder = index + 1 != locations.length;
                    let borderClass = showBorder ? ' border-b-2 border-b-gray-400' : ''
                    return (
                      <TouchableOpacity
                        onPress={() => handleLocation(loc)}
                        key={index}
                        className={'flex-row items-center border-0 p-3 px-4 mb-1' + borderClass}
                      >
                        <MapPinIcon size='20' color='gray' />
                        <Text className='text-black text-lg ml-2'>{loc?.name}, {loc?.country}</Text>
                      </TouchableOpacity>
                    )
                  })
                }
              </View>
            ) : null
          }
        </View>
        {/* forecast selection */}
        <View className='mx-4 flex justify-around flex-1 mb-2'>
          {/* location */}
          <Text className='text-white text-center text-2xl font-bold'>{location?.name},
            <Text className='text-lg font-semibold text-gray-300'> {location?.country}</Text>
          </Text>
          {/* weather image */}
          <View className='flex-row justify-center'>
            <Image
              source={weatherImages[current?.condition?.text || 'other']}
              className="w-52 h-52" />
          </View>
          {/* degree celcius */}
          <View className='space-y-2'>
            <Text className='text-center font-bold text-white text-6xl ml-5'>{current?.temp_c}&#176;</Text>
            <Text className='text-center text-white text-xl tracking-widest'>{current?.condition.text}</Text>
          </View>
          {/* other stats */}
          <View className='flex-row justify-between mx-4'>

            <View className='flex-row space-x-2 items-center'>
              <Image source={require('../assets/icons/wind.png')}
                className='w-6 h-6'
              />
              <Text className='text-white font-semibold text-base'>{current?.wind_kph}km</Text>
            </View>

            <View className='flex-row space-x-2 items-center'>
              <Image source={require('../assets/icons/drop.png')}
                className='w-6 h-6'
              />
              <Text className='text-white font-semibold text-base'>{current?.humidity}%</Text>
            </View>

            <View className='flex-row space-x-2 items-center'>
              <Image source={require('../assets/icons/sun.png')}
                className='w-6 h-6'
              />
              <Text className='text-white font-semibold text-base'>{ weather?.forecast?.forecastday[0]?.astro?.sunrise }</Text>
            </View>
          </View>
        </View>

        {/* forecast for next days */}
        <View className='mb-2 space-y-3'>
          <View className='flex-row items-center mx-5 space-x-2'>
            <CalendarDaysIcon size='22' color='white' />
            <Text className='text-white text-base'> Próximos dias</Text>
          </View>
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingHorizontal: 15 }}
            showsVerticalScrollIndicator={false}
          >
            {

              weather?.forecast?.forecastday?.map((item: any, index: any) => {
                let date = new Date(item.date)
                let options = {weekday: 'long'}
                let dayName = date.toLocaleDateString('pt-BR', options)
                dayName = dayName.split(',')[0]
                return (
                  <View
                    key={index}
                    className='flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4 mb-4'
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                  >
                    <Image source={weatherImages[item?.day?.condition?.text]}
                      className='h-11 w-11'
                    />
                    <Text className='text-white'>{dayName}</Text>
                    <Text className='text-white text-xl font-semibold'>{item?.day.avgtemp_c}&#176;</Text>
                  </View>
                )
              })
            }
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  )
}

export default HomeScreen;