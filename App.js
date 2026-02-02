import React, { useState, useCallback, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const TIP_PRESETS = [15, 18, 20, 25];
const MAX_PEOPLE = 20;
const MAX_BILL = 99999.99;

// Extracted outside App to prevent recreation on each render
const TipButton = React.memo(({ percentage, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.tipButton,
      isSelected && styles.tipButtonSelected
    ]}
    onPress={() => onPress(percentage)}
    activeOpacity={0.7}
  >
    <Text style={[
      styles.tipButtonText,
      isSelected && styles.tipButtonTextSelected
    ]}>
      {percentage}%
    </Text>
  </TouchableOpacity>
));

const StepperButton = React.memo(({ label, onPress, disabled }) => (
  <TouchableOpacity
    style={[styles.stepperButton, disabled && styles.stepperButtonDisabledBg]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
  >
    <Text style={[
      styles.stepperButtonText,
      disabled && styles.stepperButtonDisabled
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
));

export default function App() {
  const [billAmount, setBillAmount] = useState('');
  const [tipPercent, setTipPercent] = useState(18);
  const [customTip, setCustomTip] = useState('');
  const [isCustomTip, setIsCustomTip] = useState(false);
  const [peopleCount, setPeopleCount] = useState(1);

  // Sanitize bill input - only allow valid decimal numbers
  const handleBillChange = useCallback((text) => {
    // Remove non-numeric characters except decimal point
    let sanitized = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      sanitized = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    // Limit max value
    const numValue = parseFloat(sanitized);
    if (numValue > MAX_BILL) {
      return;
    }
    
    setBillAmount(sanitized);
  }, []);

  // Handle custom tip input
  const handleCustomTipChange = useCallback((text) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    const numValue = parseInt(sanitized, 10);
    
    if (sanitized === '' || (numValue >= 0 && numValue <= 100)) {
      setCustomTip(sanitized);
      setIsCustomTip(true);
      if (sanitized !== '') {
        setTipPercent(numValue);
      }
    }
  }, []);

  // Handle preset tip selection
  const handlePresetTip = useCallback((percentage) => {
    setTipPercent(percentage);
    setIsCustomTip(false);
    setCustomTip('');
  }, []);

  const incrementPeople = useCallback(() => {
    setPeopleCount(prev => Math.min(prev + 1, MAX_PEOPLE));
  }, []);

  const decrementPeople = useCallback(() => {
    setPeopleCount(prev => Math.max(prev - 1, 1));
  }, []);

  const resetCalculator = useCallback(() => {
    setBillAmount('');
    setTipPercent(18);
    setCustomTip('');
    setIsCustomTip(false);
    setPeopleCount(1);
    Keyboard.dismiss();
  }, []);

  // Memoize calculations to avoid recalculating on every render
  const calculations = useMemo(() => {
    const bill = parseFloat(billAmount) || 0;
    const effectiveTip = isCustomTip && customTip === '' ? 0 : tipPercent;
    const tipAmount = bill * (effectiveTip / 100);
    const total = bill + tipAmount;
    const perPerson = peopleCount > 0 ? total / peopleCount : 0;
    
    return { bill, tipAmount, total, perPerson };
  }, [billAmount, tipPercent, isCustomTip, customTip, peopleCount]);

  const { tipAmount, total, perPerson } = calculations;

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar style="auto" />
        
        <View style={styles.header}>
          <Text style={styles.title}>💵 Tip Calculator</Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetCalculator}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Bill Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Bill Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>£</Text>
            <TextInput
              style={styles.input}
              value={billAmount}
              onChangeText={handleBillChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#999"
              returnKeyType="done"
              onSubmitEditing={dismissKeyboard}
              maxLength={10}
            />
          </View>
        </View>

        {/* Tip Percentage */}
        <View style={styles.section}>
          <Text style={styles.label}>Tip Percentage</Text>
          <View style={styles.tipButtons}>
            {TIP_PRESETS.map((percentage) => (
              <TipButton
                key={percentage}
                percentage={percentage}
                isSelected={!isCustomTip && tipPercent === percentage}
                onPress={handlePresetTip}
              />
            ))}
          </View>
          
          {/* Custom tip input */}
          <View style={styles.customTipContainer}>
            <Text style={styles.customTipLabel}>Custom:</Text>
            <View style={[
              styles.customTipInputWrapper,
              isCustomTip && styles.customTipInputWrapperActive
            ]}>
              <TextInput
                style={styles.customTipInput}
                value={customTip}
                onChangeText={handleCustomTipChange}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#999"
                maxLength={3}
                returnKeyType="done"
                onSubmitEditing={dismissKeyboard}
              />
              <Text style={styles.customTipPercent}>%</Text>
            </View>
          </View>
        </View>

        {/* Number of People */}
        <View style={styles.section}>
          <Text style={styles.label}>Split Between</Text>
          <View style={styles.stepper}>
            <StepperButton
              label="−"
              onPress={decrementPeople}
              disabled={peopleCount <= 1}
            />
            
            <View style={styles.stepperValue}>
              <Text style={styles.stepperText}>{peopleCount}</Text>
              <Text style={styles.stepperLabel}>
                {peopleCount === 1 ? 'person' : 'people'}
              </Text>
            </View>
            
            <StepperButton
              label="+"
              onPress={incrementPeople}
              disabled={peopleCount >= MAX_PEOPLE}
            />
          </View>
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Tip Amount</Text>
            <Text style={styles.resultValue}>£{tipAmount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total</Text>
            <Text style={styles.resultValue}>£{total.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.resultRow, styles.resultRowHighlight]}>
            <Text style={styles.resultLabelHighlight}>Per Person</Text>
            <Text style={styles.resultValueHighlight}>£{perPerson.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
    marginHorizontal: 4,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  tipButtonTextSelected: {
    color: '#fff',
  },
  customTipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  customTipLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 12,
  },
  customTipInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  customTipInputWrapperActive: {
    borderColor: '#3498db',
  },
  customTipInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    minWidth: 40,
    textAlign: 'center',
  },
  customTipPercent: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7f8c8d',
    marginLeft: 4,
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
  stepperButtonDisabledBg: {
    backgroundColor: '#bdc3c7',
  },
  stepperButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepperButtonDisabled: {
    color: '#ecf0f1',
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
