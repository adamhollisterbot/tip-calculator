import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [billAmount, setBillAmount] = useState('');
  const [tipPercent, setTipPercent] = useState(18);
  const [peopleCount, setPeopleCount] = useState(1);

  const bill = parseFloat(billAmount) || 0;
  const tipAmount = bill * (tipPercent / 100);
  const total = bill + tipAmount;
  const perPerson = peopleCount > 0 ? total / peopleCount : 0;

  const TipButton = ({ percentage }) => (
    <TouchableOpacity
      style={[
        styles.tipButton,
        tipPercent === percentage && styles.tipButtonSelected
      ]}
      onPress={() => setTipPercent(percentage)}
    >
      <Text style={[
        styles.tipButtonText,
        tipPercent === percentage && styles.tipButtonTextSelected
      ]}>
        {percentage}%
      </Text>
    </TouchableOpacity>
  );

  const incrementPeople = () => setPeopleCount(prev => Math.min(prev + 1, 20));
  const decrementPeople = () => setPeopleCount(prev => Math.max(prev - 1, 1));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="auto" />
      
      <Text style={styles.title}>💵 Tip Calculator</Text>

      {/* Bill Amount */}
      <View style={styles.section}>
        <Text style={styles.label}>Bill Amount</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.input}
            value={billAmount}
            onChangeText={setBillAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Tip Percentage */}
      <View style={styles.section}>
        <Text style={styles.label}>Tip Percentage</Text>
        <View style={styles.tipButtons}>
          <TipButton percentage={15} />
          <TipButton percentage={18} />
          <TipButton percentage={20} />
        </View>
      </View>

      {/* Number of People */}
      <View style={styles.section}>
        <Text style={styles.label}>Split Between</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={decrementPeople}
            disabled={peopleCount <= 1}
          >
            <Text style={[
              styles.stepperButtonText,
              peopleCount <= 1 && styles.stepperButtonDisabled
            ]}>−</Text>
          </TouchableOpacity>
          
          <View style={styles.stepperValue}>
            <Text style={styles.stepperText}>{peopleCount}</Text>
            <Text style={styles.stepperLabel}>
              {peopleCount === 1 ? 'person' : 'people'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={incrementPeople}
            disabled={peopleCount >= 20}
          >
            <Text style={[
              styles.stepperButtonText,
              peopleCount >= 20 && styles.stepperButtonDisabled
            ]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Tip Amount</Text>
          <Text style={styles.resultValue}>${tipAmount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Total</Text>
          <Text style={styles.resultValue}>${total.toFixed(2)}</Text>
        </View>
        
        <View style={[styles.resultRow, styles.resultRowHighlight]}>
          <Text style={styles.resultLabelHighlight}>Per Person</Text>
          <Text style={styles.resultValueHighlight}>${perPerson.toFixed(2)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: '#2c3e50',
  },
  tipButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipButtonSelected: {
    backgroundColor: '#3498db',
  },
  tipButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  tipButtonTextSelected: {
    color: '#fff',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepperButton: {
    width: 50,
    height: 50,
    backgroundColor: '#3498db',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepperButtonDisabled: {
    color: '#bdc3c7',
  },
  stepperValue: {
    alignItems: 'center',
  },
  stepperText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  stepperLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  resultRowHighlight: {
    backgroundColor: '#3498db',
    marginHorizontal: -20,
    marginBottom: -20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 0,
    marginTop: 10,
  },
  resultLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  resultLabelHighlight: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  resultValueHighlight: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
});
