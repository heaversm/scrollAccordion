'use strict'

import React, { Component } from 'react';
import { AppRegistry, Animated, Dimensions, Easing, Image, Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const categoryLinks = [ //for the sake of simplicity, we use the same set of category links for all touts
  { label: 'Subcategory1' },
  { label: 'Subcategory2' },
  { label: 'Subcategory3' },
  { label: 'Subcategory4' },
  { label: 'Subcategory5' },
  { label: 'Subcategory6' },
  { label: 'Subcategory7' },
  { label: 'Subcategory8' },
  { label: 'Subcategory9' },
  { label: 'Subcategory10' },
]

const categoryTouts = [ //the touts are the clickable image items that hold our links
  { image: require('./assets/images/image01.jpg'), title: 'Category1', links: categoryLinks },
  { image: require('./assets/images/image02.jpg'), title: 'Category2', links: categoryLinks },
  { image: require('./assets/images/image03.jpg'), title: 'Category3', links: categoryLinks },
]

const SUBCATEGORY_FADE_TIME = 400 //time in ms to fade in / out our subcategories when the accordion animates
const SUBCATEGORY_HEIGHT = 40 //to save a costly measurement process, we know our subcategory items will always have a consistent height, so we can calculate how big the overall subcategory container height needs to expand to by multiplying this by the number of items
const CONTAINER_PADDING_TOP = 40 //to leave room for the device battery bar
const categoryLinksLength = categoryLinks.length //number of subcategory items - if we werent using the same set of links for all touts, we would need to store this within each tout class probably, to know how big each container should expand to to show all the links
const subcategoryContainerHeight = categoryLinksLength * SUBCATEGORY_HEIGHT //total height for the container

export class CategoryLinks extends React.PureComponent { //using PureComponent will prevent unnecessary renders

  toutPositions = [] //will hold the measured offsets of each tout when unexpanded

  render() {
    return (
      <Animated.View //view should be animated because its opacity will change
        style={{ position: 'absolute', top: 0, left: 0, opacity: this.props.subcategoryOpacity }}
      >
        <View>
          {
            this.props.links && this.props.links.map((link, index, links) => { //render our subcategory links
              return (
                <View
                  key={link.label}
                >
                  <Text style={styles.subcategoryLinks}>{link.label}</Text>
                </View>
              )
            })
          }
        </View>
      </Animated.View>
    )
  }
}

export class Tout extends React.PureComponent { //using PureComponent will prevent unnecessary renders

  state = {
    toutSubcategoriesVisible: false, //true when we the tout has been clicked on and subcategory items are exposed
  }
  animatedValue = new Animated.Value(0) //we will animate this value between 0 and 1 to hide and show the subcategories
  animCategoryHeight = this.animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, subcategoryContainerHeight], //when animated value is 1, the subcategory container will be equal to the number of links * each links height
  })

  subcategoryOpacity = new Animated.Value(0) //separate animated value for each subcategory list's opacity, as we will animate this independent of the height

  measurements = {} //will hold each tout's location on the page so that we can automatically scroll it to the top of our view

  measureToutRef = () => {
    this.toutRef.measure((x, y, width, height, pageX, pageY) => { //measuring gives us all of these properties, so we must capture them and pass down only the two we need
      this.measurements.pageY = pageY //Y position in the overall view
      this.measurements.height = height //height of the tout (really this is the same among all touts in our example, but we will allow our touts to have different heights this way)
      this.props.handleLayout(this.measurements, this.props.toutIndex) //pass this back to the parent (scrollAccordion)
    })
  }

  handlePressTout = () => {
    if (this.props.links && this.props.links.length) { //if the tout has subcategory links, hide or show them based on the current state
      const toutSubcategoriesVisible = this.state.toutSubcategoriesVisible
      if (toutSubcategoriesVisible) {
        this.hideToutSubcatgories()
      }
      else {
        this.showToutSubcatgories()
      }
    }
  }

  showToutSubcatgories = () => {
    this.setState({ toutSubcategoriesVisible: true })
    Animated.timing(this.animatedValue, { //animating this value from zero to one will update the subcategory container height, which interpolates this value
      toValue: 1,
      duration: SUBCATEGORY_FADE_TIME,
      easing: Easing.inOut(Easing.quad),
    }).start(() => {
      this.props.handlePressTout(this.props.toutIndex)
    })

    Animated.timing(this.subcategoryOpacity, {
      toValue: 1,
      duration: SUBCATEGORY_FADE_TIME,
      easing: Easing.inOut(Easing.quad),
    }).start()

  }

  hideToutSubcatgories = () => {
    Animated.timing(this.animatedValue, {
      toValue: 0,
      duration: SUBCATEGORY_FADE_TIME,
      easing: Easing.inOut(Easing.quad),
    }).start(() => {
      this.setState({ toutSubcategoriesVisible: false })
    })

    Animated.timing(this.subcategoryOpacity, {
      toValue: 0,
      duration: SUBCATEGORY_FADE_TIME,
      easing: Easing.inOut(Easing.quad),
    }).start()
  }

  setToutRef = node => { //store a reference to the tout so we can measure it
    if (node) {
      this.toutRef = node
    }
  }

  render() {
    let categoryLinks
    if (this.props.links && this.props.links.length) { //if the tout has links, render them here
      categoryLinks = (
        <Animated.View
          style={{ height: this.animCategoryHeight }}
        >
          <CategoryLinks {...this.props} isVisible={this.state.toutSubcategoriesVisible} subcategoryOpacity={this.subcategoryOpacity} />
        </Animated.View>
      )
    } else {
      categoryLinks = null
    }
    return (
      <View
        style={this.props.toutIndex === 0 ? { marginTop: 0 } : { marginTop: 5 }} //if this is the first tout, no margin is needed at top
        onLayout={!this.measurements.pageY ? this.measureToutRef : () => null} //if we already have measurements for this tout, no need to render them again. Otherwise, get the measurements
      >
        <TouchableOpacity
          ref={this.setToutRef}
          onPress={this.handlePressTout}
        >
          <Image
            source={this.props.image}
            style={styles.toutImage}
            width={'100%'}
          >
            <Text
              style={styles.toutText} //text is wrapped by image so it can be easily centered
            >
              {this.props.title}
            </Text>
          </Image>
        </TouchableOpacity>
        {categoryLinks}
      </View>
    )
  }
}

AppRegistry.registerComponent('Tout', () => Tout);

export default class scrollAccordion extends React.PureComponent { //scroll accordion is our parent class - it renders the touts and their subcategories

  measurements = []

  handlePressTout = (toutIndex) => { //when we press a tout, animate it to the top of the screen and reveal its subcategoires
    this.scrollViewRef.scrollTo({
      y: this.measurements[toutIndex].pageY - CONTAINER_PADDING_TOP,
    })
  }

  setScrollRef = node => { //store a reference to the scroll view so we can call its scrollTo method
    if (node) {
      this.scrollViewRef = node
    }
  }

  handleLayout = (measurements, toutIndex) => { //this process is expensive, so we only want to measure when necessary. Probably could be optimized even further...
    if (!this.measurements[toutIndex]) { //if they dont already exist...
      this.measurements[toutIndex] = measurements //...put the measurements of each tout into its proper place in the array
    }

  }

  render() {
    console.log('render')
    return (
      <View style={styles.container}>
        <ScrollView
          scrollEventThrottle={20} //throttling the scroll event will decrease the amount of times we store the current scroll position.
          ref={this.setScrollRef}
        >
          <View>
            {
              categoryTouts.map((tout, index) => {
                return (
                  <Tout
                    key={index}
                    toutIndex={index} //tout index will help us know which tout we are clicking on
                    {...tout}
                    handleLayout={this.handleLayout} //when layout is triggered for touts, we can measure them
                    handlePressTout={this.handlePressTout}
                  />
                )
              })
            }
          </View>
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: CONTAINER_PADDING_TOP,
    backgroundColor: 'white',
  },
  toutText: {
    color: 'white', backgroundColor: 'transparent', fontWeight: 'bold', fontSize: 24
  },
  toutImage: {
    alignItems: 'center', justifyContent: 'center'
  },
  subcategoryLinks: {
    lineHeight: 40,
  }
});

AppRegistry.registerComponent('scrollAccordion', () => scrollAccordion);