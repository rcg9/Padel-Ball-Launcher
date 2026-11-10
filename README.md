# Padel Ball Launcher 🎾

**Autonomous Padel Ball Launcher – Arduino & Android Application**

---

# 🇨🇦 Català

## 1. Descripció del projecte

Aquest repositori conté el codi i els fitxers de desenvolupament d'una **màquina autònoma llançadora de pilotes de pàdel**, desenvolupada com a Treball de Final de Grau d'Enginyeria Mecatrònica.

L'objectiu del projecte és dissenyar i construir una màquina capaç de llançar pilotes de pàdel de manera autònoma, permetent controlar diferents paràmetres del llançament i configurar entrenaments mitjançant una aplicació mòbil.

El projecte integra disseny mecànic, electrònica, programació i comunicació sense fils.

## 2. Estructura del repositori

El repositori està dividit en dues parts principals:

```text
Padel-Ball-Launcher/
│
├── ControlTotal_amb_Entrenament/
│   └── ControlTotal_amb_Entrenament.ino
│
├── PadelController/
│   ├── App.tsx
│   ├── package.json
│   ├── package-lock.json
│   ├── app.json
│   ├── src/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── navigation/
│   │   ├── screens/
│   │   └── utils/
│   ├── android/
│   └── ios/
│
├── .gitignore
└── README.md
```

### `ControlTotal_amb_Entrenament/`

Conté el programa principal de l'Arduino, encarregat de controlar el funcionament de la màquina.

**`ControlTotal_amb_Entrenament.ino`**

És el codi central del sistema. Gestiona:

- Control dels motors de llançament.
- Moviment horitzontal i vertical de la màquina.
- Regulació de la velocitat de llançament.
- Configuració dels efectes de la pilota: normal, topspin i tallat.
- Execució de diferents tipus de cops.
- Comunicació amb l'aplicació.
- Execució de seqüències d'entrenament automàtiques.

### `PadelController/`

Conté el projecte de l'aplicació mòbil desenvolupada amb React Native i TypeScript.

L'aplicació permet comunicar-se amb la màquina i controlar-ne els diferents paràmetres.

**Fitxers principals:**

| Fitxer | Funció |
|---|---|
| `App.tsx` | Punt d'entrada principal de l'aplicació. |
| `index.js` | Inicialització de l'aplicació React Native. |
| `app.json` | Configuració general del projecte. |
| `package.json` | Dependències i scripts necessaris per executar l'aplicació. |
| `package-lock.json` | Versions concretes de les dependències instal·lades. |

**Carpeta `src/`:**

| Carpeta / fitxer | Funció |
|---|---|
| `context/BluetoothContext.tsx` | Gestiona l'estat i la connexió Bluetooth. |
| `hooks/useBluetooth.ts` | Hook per accedir a les funcions Bluetooth. |
| `navigation/AppNavigator.tsx` | Gestiona la navegació entre pantalles. |
| `screens/Screen1_Connexio.tsx` | Connexió amb la màquina i informació de comunicació. |
| `screens/Screen2_Parametres.tsx` | Configuració dels paràmetres de llançament. |
| `screens/Screen3_Cops.tsx` | Selecció dels diferents tipus de cops. |
| `utils/protocol.ts` | Defineix les ordres i el protocol de comunicació. |

**Carpetes `android/` i `ios/`:**

Contenen els fitxers de configuració natius necessaris per executar l'aplicació en dispositius Android i iOS.

### `.gitignore`

Defineix quins fitxers i carpetes no s'han de pujar a GitHub, com ara dependències instal·lades, fitxers temporals, configuracions locals i elements generats durant la compilació.

## 3. Funcionament de l'aplicació

L'aplicació mòbil disposa de tres pantalles principals:

**1. Connexió**

- Cerca de dispositius Bluetooth.
- Connexió i desconnexió de la màquina.
- Visualització de l'estat de la comunicació.

**2. Paràmetres**

Permet configurar:
- Angle horitzontal: 0–180°.
- Angle vertical: 0–90°.
- Velocitat de llançament: 0–100%.
- Efecte de la pilota: normal, topspin o tallat.

**3. Cops**

Permet seleccionar diferents tipus de llançaments, com ara:
- Dreta.
- Revés.
- Volea de dreta.
- Volea d'esquerra.
- Esmaixada.
- Bandeja.
- Deixada de paret.

## 4. Entrenament automàtic

El programa Arduino incorpora un mode d'entrenament automàtic.

Aquest mode permet configurar el nombre de repeticions i executar una seqüència de llançaments predefinida, alternant diferents tipus de cops per simular una sessió d'entrenament.

## 5. Comunicació

L'aplicació i el controlador intercanvien ordres per configurar els paràmetres i controlar els moviments de la màquina.

Algunes de les ordres definides al protocol són:

| Ordre | Funció |
|---|---|
| `PWR:ON` / `PWR:OFF` | Activar o aturar la màquina. |
| `H:valor` | Configurar l'angle horitzontal. |
| `V:valor` | Configurar l'angle vertical. |
| `S:valor` | Configurar la velocitat. |
| `EF:NR` | Efecte normal. |
| `EF:TS` | Efecte topspin. |
| `EF:CU` | Efecte tallat. |
| `COP:DR` | Cop de dreta. |
| `COP:RV` | Cop de revés. |
| `ENT1:valor` | Configurar l'entrenament automàtic. |

## 6. Requisits i instal·lació

### Controlador Arduino

- Arduino IDE.
- Placa compatible amb el programa i les connexions utilitzades.
- Llibreria `Servo`.
- Llibreria `AccelStepper`.

Cal carregar el fitxer `ControlTotal_amb_Entrenament.ino` al controlador.

### Aplicació mòbil

- Node.js (versió 22.11.0 o superior).
- npm.
- Android Studio i Android SDK per executar-la en Android.

Per instal·lar les dependències, obrir un terminal dins de `PadelController/` i executar:

```bash
npm ci
```

Per iniciar el projecte:

```bash
npm start
```

Per executar l'aplicació en Android:

```bash
npm run android
```

**Nota:** cal que el mòdul Bluetooth de la màquina sigui compatible amb el sistema de comunicació BLE implementat a l'aplicació i que els paràmetres de connexió coincideixin amb la configuració del controlador.

---

# 🇪🇸 Español

## 1. Descripción del proyecto

Este repositorio contiene el código y los archivos de desarrollo de una **máquina autónoma lanzadora de pelotas de pádel**, desarrollada como Trabajo de Fin de Grado de Ingeniería Mecatrónica.

El objetivo del proyecto es diseñar y construir una máquina capaz de lanzar pelotas de pádel de forma autónoma, permitiendo controlar diferentes parámetros del lanzamiento y configurar entrenamientos mediante una aplicación móvil.

El proyecto integra diseño mecánico, electrónica, programación y comunicación inalámbrica.

## 2. Estructura del repositorio

El repositorio está dividido en dos partes principales:

### `ControlTotal_amb_Entrenament/`

Contiene el programa principal de Arduino, encargado de controlar el funcionamiento de la máquina.

**`ControlTotal_amb_Entrenament.ino`**

Es el código central del sistema. Gestiona:

- Control de los motores de lanzamiento.
- Movimiento horizontal y vertical de la máquina.
- Regulación de la velocidad de lanzamiento.
- Configuración de los efectos de la pelota: normal, topspin y cortado.
- Ejecución de diferentes tipos de golpes.
- Comunicación con la aplicación.
- Ejecución de secuencias de entrenamiento automáticas.

### `PadelController/`

Contiene el proyecto de la aplicación móvil desarrollada con React Native y TypeScript.

**Archivos principales:**

| Archivo | Función |
|---|---|
| `App.tsx` | Punto de entrada principal de la aplicación. |
| `index.js` | Inicialización de React Native. |
| `app.json` | Configuración general del proyecto. |
| `package.json` | Dependencias y scripts necesarios. |
| `package-lock.json` | Versiones concretas de las dependencias. |

**Carpeta `src/`:**

| Carpeta / archivo | Función |
|---|---|
| `context/BluetoothContext.tsx` | Gestiona el estado y la conexión Bluetooth. |
| `hooks/useBluetooth.ts` | Hook para acceder a las funciones Bluetooth. |
| `navigation/AppNavigator.tsx` | Gestiona la navegación entre pantallas. |
| `screens/Screen1_Connexio.tsx` | Conexión con la máquina y estado de comunicación. |
| `screens/Screen2_Parametres.tsx` | Configuración de los parámetros de lanzamiento. |
| `screens/Screen3_Cops.tsx` | Selección de los diferentes tipos de golpes. |
| `utils/protocol.ts` | Define las órdenes y el protocolo de comunicación. |

**Carpetas `android/` e `ios/`:**

Contienen los archivos de configuración nativos necesarios para ejecutar la aplicación en dispositivos Android e iOS.

### `.gitignore`

Define qué archivos y carpetas no deben subirse a GitHub, como dependencias instaladas, archivos temporales y elementos generados durante la compilación.

## 3. Funcionamiento de la aplicación

La aplicación móvil dispone de tres pantallas principales:

**1. Conexión**

- Búsqueda de dispositivos Bluetooth.
- Conexión y desconexión de la máquina.
- Visualización del estado de la comunicación.

**2. Parámetros**

Permite configurar:

- Ángulo horizontal: 0–180°.
- Ángulo vertical: 0–90°.
- Velocidad de lanzamiento: 0–100%.
- Efecto de la pelota: normal, topspin o cortado.

**3. Golpes**

Permite seleccionar diferentes tipos de lanzamientos:

- Derecha.
- Revés.
- Volea de derecha.
- Volea de revés.
- Remate.
- Bandeja.
- Dejada de pared.

## 4. Entrenamiento automático

El programa Arduino incorpora un modo de entrenamiento automático.

Este modo permite configurar el número de repeticiones y ejecutar una secuencia de lanzamientos predefinida, alternando diferentes tipos de golpes para simular una sesión de entrenamiento.

## 5. Comunicación

La aplicación y el controlador intercambian órdenes para configurar los parámetros y controlar los movimientos de la máquina.

Algunas de las órdenes definidas en el protocolo son:

| Orden | Función |
|---|---|
| `PWR:ON` / `PWR:OFF` | Activar o detener la máquina. |
| `H:valor` | Configurar el ángulo horizontal. |
| `V:valor` | Configurar el ángulo vertical. |
| `S:valor` | Configurar la velocidad. |
| `EF:NR` | Efecto normal. |
| `EF:TS` | Efecto topspin. |
| `EF:CU` | Efecto cortado. |
| `COP:DR` | Golpe de derecha. |
| `COP:RV` | Golpe de revés. |
| `ENT1:valor` | Configurar el entrenamiento automático. |

## 6. Requisitos e instalación

### Controlador Arduino

- Arduino IDE.
- Placa compatible con el programa y las conexiones utilizadas.
- Librería `Servo`.
- Librería `AccelStepper`.

Cargar el archivo `ControlTotal_amb_Entrenament.ino` en el controlador.

### Aplicación móvil

- Node.js (versión 22.11.0 o superior).
- npm.
- Android Studio y Android SDK para ejecutarla en Android.

Abrir un terminal dentro de `PadelController/` y ejecutar:

```bash
npm ci
```

Para iniciar el proyecto:

```bash
npm start
```

Para ejecutar la aplicación en Android:

```bash
npm run android
```

**Nota:** el módulo Bluetooth de la máquina debe ser compatible con el sistema BLE implementado en la aplicación y utilizar una configuración de comunicación compatible con el controlador.

---

# 🇬🇧 English

## 1. Project description

This repository contains the source code and development files for an **autonomous padel ball launcher**, developed as a Bachelor's Final Project in Mechatronics Engineering.

The aim of this project is to design and build a machine capable of launching padel balls autonomously, allowing users to control different launching parameters and configure training sessions through a mobile application.

The project combines mechanical design, electronics, programming and wireless communication.

## 2. Repository structure

The repository is divided into two main parts:

### `ControlTotal_amb_Entrenament/`

Contains the main Arduino program, responsible for controlling the machine.

**`ControlTotal_amb_Entrenament.ino`**

This is the central system code. It manages:

- Launch motor control.
- Horizontal and vertical machine movement.
- Launch speed regulation.
- Ball effect configuration: normal, topspin and slice.
- Execution of different shot types.
- Communication with the mobile application.
- Automatic training sequences.

### `PadelController/`

Contains the mobile application developed using React Native and TypeScript.

**Main files:**

| File | Description |
|---|---|
| `App.tsx` | Main application entry point. |
| `index.js` | React Native application initialization. |
| `app.json` | General project configuration. |
| `package.json` | Project dependencies and scripts. |
| `package-lock.json` | Exact dependency versions. |

**`src/` folder:**

| Folder / file | Description |
|---|---|
| `context/BluetoothContext.tsx` | Manages Bluetooth connection and state. |
| `hooks/useBluetooth.ts` | Hook for accessing Bluetooth functions. |
| `navigation/AppNavigator.tsx` | Handles navigation between screens. |
| `screens/Screen1_Connexio.tsx` | Machine connection and communication status. |
| `screens/Screen2_Parametres.tsx` | Launch parameter configuration. |
| `screens/Screen3_Cops.tsx` | Selection of different shot types. |
| `utils/protocol.ts` | Defines commands and the communication protocol. |

**`android/` and `ios/` folders:**

Contain the native configuration files required to run the application on Android and iOS devices.

### `.gitignore`

Defines which files and folders should not be uploaded to GitHub, such as installed dependencies, temporary files, local configuration files and generated build files.

## 3. Application functionality

The mobile application has three main screens:

**1. Connection**

- Bluetooth device scanning.
- Connect and disconnect from the machine.
- Communication status monitoring.

**2. Parameters**

Allows users to configure:

- Horizontal angle: 0–180°.
- Vertical angle: 0–90°.
- Launch speed: 0–100%.
- Ball effect: normal, topspin or slice.

**3. Shots**

Allows users to select different shot types:

- Forehand.
- Backhand.
- Forehand volley.
- Backhand volley.
- Smash.
- Bandeja.
- Wall drop shot.

## 4. Automatic training mode

The Arduino program includes an automatic training mode.

This mode allows users to configure the number of repetitions and execute a predefined sequence of launches, alternating between different shot types to simulate a training session.

## 5. Communication

The mobile application and the controller exchange commands to configure parameters and control the machine's movements.

Some of the commands defined in the protocol are:

| Command | Function |
|---|---|
| `PWR:ON` / `PWR:OFF` | Turn the machine on or off. |
| `H:value` | Set the horizontal angle. |
| `V:value` | Set the vertical angle. |
| `S:value` | Set the launch speed. |
| `EF:NR` | Normal effect. |
| `EF:TS` | Topspin effect. |
| `EF:CU` | Slice effect. |
| `COP:DR` | Forehand shot. |
| `COP:RV` | Backhand shot. |
| `ENT1:value` | Configure automatic training. |

## 6. Requirements and installation

### Arduino controller

- Arduino IDE.
- Board compatible with the program and its hardware connections.
- `Servo` library.
- `AccelStepper` library.

Upload `ControlTotal_amb_Entrenament.ino` to the controller.

### Mobile application

- Node.js (version 22.11.0 or higher).
- npm.
- Android Studio and Android SDK for Android deployment.

Open a terminal inside `PadelController/` and run:

```bash
npm ci
```

To start the project:

```bash
npm start
```

To run the application on Android:

```bash
npm run android
```

**Note:** the machine's Bluetooth module must be compatible with the BLE communication system implemented in the application, and its communication settings must match the controller configuration.

---

## Repository

GitHub: https://github.com/rcg9/Padel-Ball-Launcher