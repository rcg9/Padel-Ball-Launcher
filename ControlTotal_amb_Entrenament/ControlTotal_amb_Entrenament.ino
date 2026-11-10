#include <Servo.h>
#include <AccelStepper.h>

String ordre;

int valorActualH = 90;
int valorActualV = 0;
int velocitatActual = 0;
String efecteActual = "NR";
String copActual = "";

bool maquinaEngegada = false;
bool retornInicialFet = false;
bool bluetoothAnterior = false;

// ---------------------- Entrenament ----------------------
bool entrenamentActiu = false;
int entrenamentRepeticions = 0;
int entrenamentRepeticioActual = 0;
int entrenamentPas = 0;

unsigned long tempsUltimCop = 0;

const unsigned long TEMPS_ENTRE_COPS_MS = 4000;

// ---------------------- Pins ESC motors de llançament ----------------------
const int PIN_ESC_SUPERIOR = 8; //Horari
const int PIN_ESC_INFERIOR = 9; //Antihorari

Servo escSuperior;
Servo escInferior;

// ---------------------- Pin STATE del Bluetooth HC-05/06 ----------------------
const int PIN_BT_STATE = 22;

// En la majoria de HC-05/06: HIGH = connectat, LOW = desconnectat
const int BT_CONNECTAT = HIGH;

// ---------------------- Valors ESC ----------------------
const int ESC_STOP_US = 1000;   //Min 1047 --> Apagat 1045
const int ESC_MIN_US  = 1050;   //Màx 1982 i a 1530 el driver comença a fer una mica de soroll
const int ESC_MAX_US  = 2000;   //Alimentat amb 15,3 V

// Diferència entre rodes per generar efecte
const int DIFERENCIA_EFECTE_US = 80;


// ---------- PINS MOTOR HORITZONTAL ----------
#define STEP_H 26
#define DIR_H  27

// ---------- PINS MOTOR VERTICAL ----------
#define STEP_V 28
#define DIR_V  29

// ---------- ENABLE OPCIONAL ----------
#define EN_PIN 6

// Crear objectes stepper
AccelStepper motorH(AccelStepper::DRIVER, STEP_H, DIR_H);
AccelStepper motorV(AccelStepper::DRIVER, STEP_V, DIR_V);

// Paràmetres del motor
const int stepsPerRev = 200;     // motor de 1.8º -> 200 passos/volta
const int microstep   = 16;      // depèn de com configures el driver
const float ratioH    = 0.5;     // relació mecànica horitzontal
const float ratioV    = 0.5;     // relació mecànica vertical

// Variables per guardar la posició actual en passos
long targetH = 0;
long targetV = 0;

// ---------- Funció angle -> passos ----------
long angleToSteps(float angleDeg, float ratio) {
  return (long)((angleDeg / 360.0) * stepsPerRev * microstep * ratio);
}


// ---------------------------------------------------------------------------
// Comprova si el Bluetooth està connectat
// ---------------------------------------------------------------------------
bool bluetoothConnectat() {
  return digitalRead(PIN_BT_STATE) == BT_CONNECTAT;
}


// ---------------------------------------------------------------------------
// Envia la configuració actual a l'app
// ---------------------------------------------------------------------------
void enviarConfiguracioApp() {
  Serial1.print("CFG:");
  Serial1.print("COP=");
  Serial1.print(copActual);
  Serial1.print(";H=");
  Serial1.print(valorActualH);
  Serial1.print(";V=");
  Serial1.print(valorActualV);
  Serial1.print(";S=");
  Serial1.print(velocitatActual);
  Serial1.print(";EF=");
  Serial1.print(efecteActual);
  Serial1.print(";PWR=");
  Serial1.print(maquinaEngegada ? "ON" : "OFF");
  Serial1.print(";BT=");
  Serial1.println(bluetoothConnectat() ? "ON" : "OFF");
}


// ---------------------------------------------------------------------------
// Mou el motor horitzontal
// ---------------------------------------------------------------------------
void moureMotorHoritzontal(int valorH) {
  valorH = constrain(valorH, 0, 180);

  int angleMotorH = valorH - 90;  // H:90 = centre, H:0 = -90, H:180 = +90

  targetH = angleToSteps(angleMotorH, ratioH);
  motorH.moveTo(targetH);

  Serial.print("Movent H app: ");
  Serial.print(valorH);
  Serial.print(" | Angle motor H: ");
  Serial.println(angleMotorH);
}


// ---------------------------------------------------------------------------
// Mou el motor vertical
// ---------------------------------------------------------------------------
/*void moureMotorVertical(int valorV) {
  targetV = angleToSteps(valorV, ratioV);
  motorV.moveTo(targetV);

  Serial.print("Movent V a angle ");
  Serial.println(valorV);
}*/

void moureMotorVertical(int valorV) {
  valorV = constrain(valorV, 0, 90);

  int angleMotorV = -valorV;  // V:0 = 0º, V:90 = -90º

  targetV = angleToSteps(angleMotorV, ratioV);
  motorV.moveTo(targetV);

  Serial.print("Movent V app: ");
  Serial.print(valorV);
  Serial.print(" | Angle motor V: ");
  Serial.println(angleMotorV);
}


// ---------------------------------------------------------------------------
// Torna els motors pas a pas a la posició inicial
// ---------------------------------------------------------------------------
void tornarPosicioInicial() {
  valorActualH = 90;
  valorActualV = 0;
  copActual = "";

  moureMotorHoritzontal(valorActualH);
  moureMotorVertical(valorActualV);

  Serial.println("Motors pas a pas tornant a la posicio inicial");
}


// ---------------------------------------------------------------------------
// Aplica la velocitat als motors de llançament
// ---------------------------------------------------------------------------
void aplicarMotorsLlancament() {

  if (!maquinaEngegada) {
    escSuperior.writeMicroseconds(ESC_STOP_US);
    escInferior.writeMicroseconds(ESC_STOP_US);
    return;
  }

  int velocitatLimitada = constrain(velocitatActual, 0, 100);
if (velocitatLimitada == 0) {
  escSuperior.writeMicroseconds(ESC_STOP_US);
  escInferior.writeMicroseconds(ESC_STOP_US);
  return;
}
  int pwmBase = map(velocitatLimitada, 1, 100, ESC_MIN_US, ESC_MAX_US);

  int pwmSuperior = pwmBase;
  int pwmInferior = pwmBase;

  if (efecteActual == "TS") {
    // Topspin: roda superior més ràpida
    pwmSuperior = pwmBase + DIFERENCIA_EFECTE_US;
    pwmInferior = pwmBase - DIFERENCIA_EFECTE_US;
  }
  else if (efecteActual == "CU") {
    // Cut: roda inferior més ràpida
    pwmSuperior = pwmBase - DIFERENCIA_EFECTE_US;
    pwmInferior = pwmBase + DIFERENCIA_EFECTE_US;
  }
  else {
    // Tir normal
    pwmSuperior = pwmBase;
    pwmInferior = pwmBase;
  }

  pwmSuperior = constrain(pwmSuperior, ESC_MIN_US, ESC_MAX_US);
  pwmInferior = constrain(pwmInferior, ESC_MIN_US, ESC_MAX_US);

  escSuperior.writeMicroseconds(pwmSuperior);
  escInferior.writeMicroseconds(pwmInferior);

  Serial.print("Motors aplicats -> Superior: ");
  Serial.print(pwmSuperior);
  Serial.print(" us | Inferior: ");
  Serial.print(pwmInferior);
  Serial.println(" us");
}


// ---------------------------------------------------------------------------
// Engegar màquina
// ---------------------------------------------------------------------------
void engegarMaquina() {

  if (!bluetoothConnectat()) {
    Serial.println("No es pot engegar: Bluetooth no connectat.");
    maquinaEngegada = false;
    escSuperior.writeMicroseconds(ESC_STOP_US);
    escInferior.writeMicroseconds(ESC_STOP_US);
    enviarConfiguracioApp();
    return;
  }

  maquinaEngegada = true;

  Serial.println("MAQUINA ENGEGADA");
  Serial.println("Els motors de llançament comencen a girar");

  aplicarMotorsLlancament();
  enviarConfiguracioApp();
}


// ---------------------------------------------------------------------------
// Parar màquina
// ---------------------------------------------------------------------------
void pararMaquina() {
  maquinaEngegada = false;
  entrenamentActiu = false;

  escSuperior.writeMicroseconds(ESC_STOP_US);
  escInferior.writeMicroseconds(ESC_STOP_US);

  Serial.println("MAQUINA PARADA");
  Serial.println("Motors de llançament parats");

  enviarConfiguracioApp();
}


// ---------------------------------------------------------------------------
// Configura un cop programat
// ---------------------------------------------------------------------------
void configurarCop(String cop, int valorH, int valorV, int velocitat, String efecte) {
  copActual = cop;
  valorActualH = constrain(valorH, 0, 180);
  valorActualV = valorV;
  velocitatActual = velocitat;
  efecteActual = efecte;

  moureMotorHoritzontal(valorActualH);
  moureMotorVertical(valorActualV);

  enviarConfiguracioApp();

  Serial.print("Configuracio enviada a l'app: ");
  Serial.print("COP=");
  Serial.print(copActual);
  Serial.print(" H=");
  Serial.print(valorActualH);
  Serial.print(" V=");
  Serial.print(valorActualV);
  Serial.print(" S=");
  Serial.print(velocitatActual);
  Serial.print(" EF=");
  Serial.print(efecteActual);
  Serial.print(" PWR=");
  Serial.print(maquinaEngegada ? "ON" : "OFF");
  Serial.print(" BT=");
  Serial.println(bluetoothConnectat() ? "ON" : "OFF");

  if (maquinaEngegada) {
    aplicarMotorsLlancament();
  }
}


// ---------------------------------------------------------------------------
// Inicia l'entrenament 1
// ---------------------------------------------------------------------------
void iniciarEntrenament1(int repeticions) {
  repeticions = constrain(repeticions, 1, 50);

  entrenamentActiu = true;
  entrenamentRepeticions = repeticions;
  entrenamentRepeticioActual = 0;
  entrenamentPas = 0;
  tempsUltimCop = 0;

  Serial.print("Entrenament 1 iniciat. Repeticions: ");
  Serial.println(entrenamentRepeticions);
}


// ---------------------------------------------------------------------------
// Processa l'entrenament 1
// ---------------------------------------------------------------------------
void processarEntrenament() {

  if (!entrenamentActiu) {
    return;
  }

  if (!maquinaEngegada) {
    Serial.println("Entrenament aturat: maquina apagada.");
    entrenamentActiu = false;
    return;
  }

  unsigned long tempsAra = millis();

  if (tempsUltimCop != 0 && tempsAra - tempsUltimCop < TEMPS_ENTRE_COPS_MS) {
    return;
  }

  if (entrenamentRepeticioActual >= entrenamentRepeticions) {
    entrenamentActiu = false;
    tornarPosicioInicial();

    Serial.println("Entrenament 1 finalitzat");
    enviarConfiguracioApp();
    return;
  }

  if (entrenamentPas == 0) {

    if (random(0, 2) == 0) {
      configurarCop("VD", 75, 18, 45, "NR");
      Serial.print("Entrenament 1 - Repeticio ");
      Serial.print(entrenamentRepeticioActual + 1);
      Serial.println(": Volea Dreta");
    }
    else {
      configurarCop("VE", 105, 18, 45, "NR");
      Serial.print("Entrenament 1 - Repeticio ");
      Serial.print(entrenamentRepeticioActual + 1);
      Serial.println(": Volea Esquerra");
    }

    entrenamentPas = 1;
    tempsUltimCop = tempsAra;
  }

  else if (entrenamentPas == 1) {
    configurarCop("GL", 90, 75, 40, "NR");

    Serial.print("Entrenament 1 - Repeticio ");
    Serial.print(entrenamentRepeticioActual + 1);
    Serial.println(": Globo");

    entrenamentPas = 0;
    entrenamentRepeticioActual++;
    tempsUltimCop = tempsAra;
  }
}


void setup() {
  Serial.begin(9600);
  Serial1.begin(9600);   // HC-05/06 al Serial1 del Mega
  Serial1.setTimeout(50);

  randomSeed(analogRead(A15));

  pinMode(PIN_BT_STATE, INPUT);

  escSuperior.attach(PIN_ESC_SUPERIOR);
  escInferior.attach(PIN_ESC_INFERIOR);

  pinMode(EN_PIN, OUTPUT);
  digitalWrite(EN_PIN, LOW); // habilitar drivers

  motorH.setMaxSpeed(1500);
  motorH.setAcceleration(800);

  motorV.setMaxSpeed(1500);
  motorV.setAcceleration(800);

  // Senyal mínima perquè els ESC quedin parats en iniciar
  escSuperior.writeMicroseconds(ESC_STOP_US);
  escInferior.writeMicroseconds(ESC_STOP_US);

  delay(3000); // Temps perquè els ESC s'inicialitzin

  bluetoothAnterior = bluetoothConnectat();

  Serial.println("Bluetooth Iniciat - HC-05/06");
  Serial.println("ESC inicialitzats");
  Serial.println("Pin STATE Bluetooth configurat al pin 22");
}


void loop() {

  bool btAra = bluetoothConnectat();

  // --------------------------------------------------------
  // Si el Bluetooth es desconnecta, para la màquina i torna a posició inicial
  // --------------------------------------------------------
  if (!btAra && bluetoothAnterior && !retornInicialFet) {
    Serial.println("Bluetooth desconnectat. Parant maquina per seguretat.");
    pararMaquina();
    tornarPosicioInicial();
    retornInicialFet = true;
  }

  // --------------------------------------------------------
  // Si el Bluetooth es reconnecta, envia l'estat actual a l'app
  // --------------------------------------------------------
  if (btAra && !bluetoothAnterior) {
    Serial.println("Bluetooth reconnectat. Enviant configuracio actual a l'app.");
    enviarConfiguracioApp();
    retornInicialFet = false;
  }

  bluetoothAnterior = btAra;


  // --------------------------------------------------------
  // Processa entrenament
  // --------------------------------------------------------
  processarEntrenament();


  // --------------------------------------------------------
  // Llegeix el que li arriba per via Bluetooth
  // --------------------------------------------------------
  if (Serial1.available() > 0) {

    ordre = Serial1.readStringUntil('\n');
    ordre.trim();

    String ordreNorm = ordre;
    ordreNorm.toUpperCase();

    Serial.print("Ordre rebuda per Bluetooth: ");
    Serial.println(ordre);

    // --------------------------------------------------------
    // Engegar màquina
    // --------------------------------------------------------
    if (ordreNorm == "PWR:ON") {
      engegarMaquina();
    }

    // --------------------------------------------------------
    // Parar màquina
    // --------------------------------------------------------
    else if (ordreNorm == "PWR:OFF") {
      pararMaquina();
    }

    // --------------------------------------------------------
    // Entrenament 1
    // --------------------------------------------------------
    else if (ordreNorm.startsWith("ENT1")) {

      int repeticions = 1;

      int separador = ordreNorm.indexOf(':');

      if (separador >= 0) {
        repeticions = ordreNorm.substring(separador + 1).toInt();
      }

      iniciarEntrenament1(repeticions);
    }

    // --------------------------------------------------------
    // Moviment horitzontal dels motors pas a pas
    // --------------------------------------------------------
    else if (ordre.startsWith("H:")) {
      entrenamentActiu = false;

      int valorH = ordre.substring(2).toInt();
      valorH = constrain(valorH, 0, 180);

      valorActualH = valorH;
      copActual = "";

      Serial.print("Moviment horitzontal rebut. Valor: ");
      Serial.println(valorH);

      Serial.println("El canó es mouria en direcció horitzontal");

      moureMotorHoritzontal(valorActualH);

      enviarConfiguracioApp();
    }

    // --------------------------------------------------------
    // Moviment vertical dels motors pas a pas
    // --------------------------------------------------------
    else if (ordre.startsWith("V:")) {
      entrenamentActiu = false;

      int valorV = ordre.substring(2).toInt();

      valorActualV = valorV;
      copActual = "";

      Serial.print("Moviment vertical rebut. Valor: ");
      Serial.println(valorV);

      Serial.println("El canó es mouria en direcció vertical");

      moureMotorVertical(valorActualV);

      enviarConfiguracioApp();
    }

    // --------------------------------------------------------
    // Velocitat dels motors de llançament
    // --------------------------------------------------------
    else if (ordre.startsWith("S:")) {
      entrenamentActiu = false;

      int velocitat = ordre.substring(2).toInt();

      velocitatActual = constrain(velocitat, 0, 100);
      copActual = "";

      Serial.print("Velocitat rebuda. Valor: ");
      Serial.println(velocitatActual);

      Serial.println("Es modificaria la velocitat dels motors de llançament");

      if (maquinaEngegada) {
        aplicarMotorsLlancament();
      }

      enviarConfiguracioApp();
    }

    // --------------------------------------------------------
    // Efecte de la pilota
    // --------------------------------------------------------
    else if (ordre.startsWith("EF:")) {
      entrenamentActiu = false;

      String efecte = ordre.substring(3);
      efecte.trim();
      efecte.toUpperCase();

      Serial.print("Efecte rebut: ");
      Serial.println(efecte);

      if (efecte == "TS") {
        efecteActual = efecte;
        copActual = "";
        Serial.println("Es faria un tir liftat / topspin");
      }
      else if (efecte == "CU") {
        efecteActual = efecte;
        copActual = "";
        Serial.println("Es faria un tir tallat / cut");
      }
      else if (efecte == "NR") {
        efecteActual = efecte;
        copActual = "";
        Serial.println("Es faria un tir normal");
      }
      else {
        Serial.println("Efecte no reconegut");
        return;
      }

      if (maquinaEngegada) {
        aplicarMotorsLlancament();
      }

      enviarConfiguracioApp();
    }

    // --------------------------------------------------------
    // Cops programats
    // --------------------------------------------------------
    else if (ordre.startsWith("COP:")) {
      entrenamentActiu = false;

      String cop = ordre.substring(4);
      cop.trim();
      cop.toUpperCase();

      Serial.print("Cop rebut: ");
      Serial.println(cop);

      if (cop == "DR") {
        configurarCop("DR", 85, 19, 47, "NR");
        Serial.println("Dreta");
      }
      else if (cop == "RV") {
        configurarCop("RV", 95, 19, 47, "NR");
        Serial.println("Reves");
      }
      else if (cop == "VD") {
        configurarCop("VD", 85, 17, 52, "NR");
        Serial.println("Volea Dreta");
      }
      else if (cop == "VE") {
        configurarCop("VE", 95, 17, 52, "NR");
        Serial.println("Volea Esquerra");
      }
      else if (cop == "SM") {
        configurarCop("SM", 90, 52, 34, "TS");
        Serial.println("Smash");
      }
      else if (cop == "BD") {
        configurarCop("BD", 90, 43, 39, "NR");
        Serial.println("Bandeja");
      }
      else if (cop == "BV") {
        configurarCop("BV", 90, 43, 41, "CU");
        Serial.println("Baixada de Paret");
      }
      else {
        Serial.println("Cop no reconegut");
      }
    }

    else {
      Serial.println("Ordre no reconeguda");
    }
  }

  // Cal cridar run() contínuament
  motorH.run();
  motorV.run();
}