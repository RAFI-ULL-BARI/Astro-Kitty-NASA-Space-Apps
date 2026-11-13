import {STORM_DURATION} from './story-training.js';
import {tr,t} from './strings.js';

export const LINES = {
  choose:[t('pipName'),t('chooseLine')],
  welcome:[tr("text098"),tr("text099")],
  approachHome:[tr("text100"),tr("text101")],
  approachLand:[tr("text100"),tr("text102")],
  landing:[tr("text100"),tr("text103")],
  landingHello:[tr("text100"),tr("text104")],
  walk:[tr("text100"),tr("text105")],
  clean:[tr("text100"),tr("text106")],
  panelDone:[tr("text100"),tr("text107")],
  panelsDone:[tr("text100"),tr("text108")],
  connect:[tr("text100"),tr("text109")],
  connected:[tr("text100"),tr("text110")],
  warning:[tr("text100"),tr("text111")],
  return:[tr("text100"),tr("text112")],
  airlock:[tr("text100"),tr("text113")],
  sealed:[tr("text100"),tr("text114")],
  pressure:[tr("text100"),tr("text115")],
  ready:[tr("text100"),tr("text116")],
  shelter:[tr("text100"),tr("text117")],
  power:[tr("text100"),tr("text118")],
  overBudget:[tr("text100"),tr("text119")],
  powerDone:[tr("text100"),tr("text120")],
  monitor:[tr("text100"),tr("text121")],
  elevated:[tr("text100"),tr("text122")],
  falling:[tr("text100"),tr("text123")],
  clear:[tr("text100"),tr("text124")],
  rover:[tr("text100"),tr("text125")],
  scanDone:[tr("text100"),tr("text126")],
  careful:[tr("text100"),tr("text127")],
  finale:[tr("text100"),tr("text128")],
  complete:[tr("text100"),tr("text129")],
};
LINES.connect=[t('pipName'),t('upgradeConnectLine')];
LINES.plugRight=[t('pipName'),t('upgradePlugRight')];
LINES.cableWrong=[t('pipName'),t('upgradeCableWrong')];
LINES.connected=[t('pipName'),t('upgradeConnected')];
LINES.connectorTip=[t('pipName'),t('upgradeConnectorTip')];
LINES.warning=[t('pipName'),t('upgradeWarning')];
LINES.airlock=[t('pipName'),t('upgradeAirlock')];
LINES.pressure=[t('pipName'),t('upgradePressure')];
LINES.ready=[t('pipName'),t('upgradeReady')];
LINES.shelter=[t('pipName'),t('upgradeShelter')];
LINES.gateClosing=[t('pipName'),t('upgradeGateClosing')];
LINES.gateSealed=[t('pipName'),t('upgradeGateSealed')];
LINES.power=[t('pipName'),t('upgradePowerAir')];
LINES.powerRadio=[t('pipName'),t('upgradePowerRadio')];
LINES.airHint=[t('pipName'),t('upgradeAirHint')];
LINES.roverPriority=[t('pipName'),t('upgradeRoverPriority')];
LINES.saveBattery=[t('pipName'),t('upgradeSaveBattery')];
LINES.powerDone=[t('pipName'),t('upgradePowerDone')];
LINES.selectCable=[t('pipName'),t('upgradeSelectCable')];
LINES.selectBattery=[t('pipName'),t('upgradeSelectBattery')];
LINES.monitor=[t('pipName'),t('upgradeMonitor')];
LINES.elevated=[t('pipName'),t('upgradeElevated')];
LINES.falling=[t('pipName'),t('upgradeFalling')];
LINES.clear=[t('pipName'),t('upgradeClear')];
LINES.rover=[t('pipName'),t('upgradeRover')];
export const SCENES = {
  approach:{chapter:tr("text130"),kind:'film',seconds:16,next:'landing',line:'welcome',view:'space'},
  landing:{chapter:tr("text131"),kind:'film',seconds:10,next:'choose',line:'landing',view:'surface'},
  choose:{chapter:t('chooseAdventure'),kind:'choice',line:'choose',view:'surface'},
  walk:{chapter:tr("text132"),kind:'walk',line:'walk',view:'surface'},
  clean:{chapter:tr("text133"),kind:'walk',line:'clean',view:'surface'},
  connect:{chapter:tr("text134"),kind:'puzzle',line:'connect',view:'surface'},
  warning:{chapter:tr("text071"),kind:'film',seconds:STORM_DURATION,next:'return',line:'warning',view:'surface'},
  return:{chapter:tr("text135"),kind:'walk',line:'return',view:'surface'},
  airlock:{chapter:tr("text136"),kind:'airlock',line:'airlock',view:'airlock'},
  shelter:{chapter:tr("text137"),kind:'walk',line:'shelter',view:'interior'},
  power:{chapter:tr("text138"),kind:'puzzle',line:'power',view:'interior'},
  monitor:{chapter:tr("text139"),kind:'monitor',line:'monitor',view:'interior'},
  rover:{chapter:tr("text140"),kind:'drive',line:'rover',view:'surface'},
  finale:{chapter:tr("text141"),kind:'film',seconds:9,next:'complete',line:'finale',view:'interior'},
  complete:{chapter:tr("text142"),kind:'end',line:'complete',view:'interior'},
};
export const PATCHES = [
  {id:'steps',name:tr("text131"),symbol:'paw'},
  {id:'sun',name:tr("text143"),symbol:'sun'},
  {id:'crew',name:tr("text144"),symbol:'heart'},
  {id:'storm',name:tr("text145"),symbol:'shield'},
  {id:'rover',name:tr("text146"),symbol:'rover'},
];

LINES.roverDone=[t('pipName'),t('roverAllDone')];
LINES.welcome=[LINES.welcome[0],t('dhruboHello')+' '+LINES.welcome[1]];
