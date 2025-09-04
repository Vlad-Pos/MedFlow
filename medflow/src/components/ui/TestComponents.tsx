import React from 'react'
import { 
  Button, 
  Input, 
  Select, 
  TextArea,
  MedicalButton,
  MedicalInput,
  MedicalSelect,
  FadeIn,
  SlideIn,
  ScaleIn,
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardFooter,
  Container,
  Grid,
  GridItem
} from './index'

const TestComponents: React.FC = () => {
  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ]

  return (
    <Container size="lg" padding="lg">
      <h1 className="text-3xl font-bold text-white mb-8">UI Component Library Test</h1>
      
      {/* Core Components */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-6">Core Components</h2>
        
        <Grid columns={2} gap="lg">
          <GridItem>
            <Card variant="elevated" size="lg">
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
                <CardSubtitle>Testing all button variants</CardSubtitle>
              </CardHeader>
              <div className="space-y-3">
                <Button variant="primary" size="sm">Primary Small</Button>
                <Button variant="secondary" size="md">Secondary Medium</Button>
                <Button variant="outline" size="lg">Outline Large</Button>
                <Button variant="ghost" size="xl">Ghost XL</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card variant="outlined" size="lg">
              <CardHeader>
                <CardTitle>Input Variants</CardTitle>
                <CardSubtitle>Testing all input variants</CardSubtitle>
              </CardHeader>
              <div className="space-y-3">
                <Input label="Default Input" placeholder="Enter text..." />
                <Input label="Outlined Input" variant="outlined" placeholder="Enter text..." />
                <Input label="Filled Input" variant="filled" placeholder="Enter text..." />
                <Input label="Input with Error" error="This field is required" />
                <Input label="Input with Success" success="Great job!" />
              </div>
            </Card>
          </GridItem>
        </Grid>
        
        <Grid columns={2} gap="lg" className="mt-6">
          <GridItem>
            <Card variant="filled" size="lg">
              <CardHeader>
                <CardTitle>Select Component</CardTitle>
                <CardSubtitle>Testing select functionality</CardSubtitle>
              </CardHeader>
              <Select 
                label="Choose an option" 
                options={selectOptions} 
                placeholder="Select an option..."
              />
            </Card>
          </GridItem>
          
          <GridItem>
            <Card variant="default" size="lg">
              <CardHeader>
                <CardTitle>TextArea Component</CardTitle>
                <CardSubtitle>Testing textarea features</CardSubtitle>
              </CardHeader>
              <TextArea 
                label="Description" 
                placeholder="Enter description..."
                showCharCount
                maxLength={100}
                aiSuggestion="Consider adding more details about symptoms"
              />
            </Card>
          </GridItem>
        </Grid>
      </section>
      
      {/* Medical Components */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-6">Medical Components</h2>
        
        <Grid columns={3} gap="lg">
          <GridItem>
            <Card variant="elevated" size="md">
              <CardHeader>
                <CardTitle>Medical Buttons</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <MedicalButton variant="medical" medicalContext="appointment">
                  Schedule Appointment
                </MedicalButton>
                <MedicalButton variant="emergency" medicalContext="emergency">
                  Emergency
                </MedicalButton>
              </div>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card variant="outlined" size="md">
              <CardHeader>
                <CardTitle>Medical Inputs</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                <MedicalInput 
                  label="Symptoms" 
                  medicalContext="symptom"
                  aiSuggestions={['Fever', 'Headache', 'Nausea']}
                  showAISuggestions
                />
                <MedicalInput 
                  label="Diagnosis" 
                  medicalContext="diagnosis"
                  warning="Please provide more details"
                />
              </div>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card variant="filled" size="md">
              <CardHeader>
                <CardTitle>Medical Select</CardTitle>
              </CardHeader>
              <MedicalSelect 
                label="Priority Level"
                medicalContext="priority"
                options={[
                  { value: 'low', label: 'Low Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'high', label: 'High Priority' }
                ]}
                placeholder="Select priority..."
              />
            </Card>
          </GridItem>
        </Grid>
      </section>
      
      {/* Animation Components */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-6">Animation Components</h2>
        
        <Grid columns={3} gap="lg">
          <GridItem>
            <FadeIn direction="up" delay={0.1}>
              <Card variant="elevated" size="md">
                <CardHeader>
                  <CardTitle>Fade In Up</CardTitle>
                </CardHeader>
                <p className="text-white/80">This card fades in from below</p>
              </Card>
            </FadeIn>
          </GridItem>
          
          <GridItem>
            <SlideIn direction="left" delay={0.2}>
              <Card variant="outlined" size="md">
                <CardHeader>
                  <CardTitle>Slide In Left</CardTitle>
                </CardHeader>
                <p className="text-white/80">This card slides in from the right</p>
              </Card>
            </SlideIn>
          </GridItem>
          
          <GridItem>
            <ScaleIn scale="medium" delay={0.3}>
              <Card variant="filled" size="md">
                <CardHeader>
                  <CardTitle>Scale In</CardTitle>
                </CardHeader>
                <p className="text-white/80">This card scales in from small to full size</p>
              </Card>
            </ScaleIn>
          </GridItem>
        </Grid>
      </section>
      
      {/* Layout Components */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white mb-6">Layout Components</h2>
        
        <Container size="md" padding="lg">
          <Card variant="elevated" size="lg">
            <CardHeader>
              <CardTitle>Layout Demo</CardTitle>
              <CardSubtitle>Testing container and grid layouts</CardSubtitle>
            </CardHeader>
            
            <Grid columns={4} gap="md" className="mb-6">
              <GridItem span={2}>
                <div className="bg-white/10 p-4 rounded-lg text-center">
                  <p className="text-white">Span 2</p>
                </div>
              </GridItem>
              <GridItem>
                <div className="bg-white/10 p-4 rounded-lg text-center">
                  <p className="text-white">Span 1</p>
                </div>
              </GridItem>
              <GridItem>
                <div className="bg-white/10 p-4 rounded-lg text-center">
                  <p className="text-white">Span 1</p>
                </div>
              </GridItem>
            </Grid>
            
            <CardFooter>
              <p className="text-white/60">Layout components working correctly!</p>
            </CardFooter>
          </Card>
        </Container>
      </section>
    </Container>
  )
}

export default TestComponents
