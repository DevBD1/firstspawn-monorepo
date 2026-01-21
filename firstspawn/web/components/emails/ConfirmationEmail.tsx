import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface ConfirmationEmailProps {
  confirmationLink: string;
}

export const ConfirmationEmail = ({
  confirmationLink,
}: ConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirm your subscription to FirstSpawn</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>CONFIRM PROTOCOL</Heading>
        <Text style={text}>
          Traveler,
          <br />
          <br />
          We received a request to add this frequency to our secure channel. To complete the handshake, please verify your identity.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={confirmationLink}>
            INITIALIZE CONNECTION
          </Button>
        </Section>
        <Text style={footer}>
          If you did not request this, please ignore this transmission.
          <br />
          <br />
          FirstSpawn Identity Node
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#0B131A',
  color: '#ADCDE2',
  fontFamily: 'monospace',
};

const container = {
  padding: '40px 20px',
  margin: '0 auto',
};

const h1 = {
  color: '#4ADE80',
  fontSize: '24px',
  letterSpacing: '2px',
  textAlign: 'center' as const,
  marginBottom: '40px',
};

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#ADCDE2',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '40px 0',
};

const button = {
  backgroundColor: '#2EBCDA',
  borderRadius: '0',
  color: '#000',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  letterSpacing: '1px',
};

const footer = {
  fontSize: '12px',
  color: '#526b7c',
  marginTop: '40px',
  textAlign: 'center' as const,
};

export default ConfirmationEmail;
