import type { Merchant, Crop } from '@/types/game';

export function calculateMerchantInitialOffer(
  merchant: Merchant,
  crop: Crop,
  quantity: number,
  quality: number
): number {
  const baseUnitPrice = crop.basePrice * merchant.basePriceMultiplier;
  const qualityBonus = 1 + (quality - 50) / 100;
  const opinionModifier = 1 + merchant.opinion / 200;

  let unitPrice = baseUnitPrice * qualityBonus * opinionModifier;

  switch (merchant.personality) {
    case 'aggressive':
      unitPrice *= 0.75;
      break;
    case 'friendly':
      unitPrice *= 1.05;
      break;
    case 'greedy':
      unitPrice *= 0.6;
      break;
    case 'cautious':
      unitPrice *= 0.9;
      break;
    case 'mysterious':
      unitPrice *= 0.8 + Math.random() * 0.4;
      break;
  }

  return Math.round(unitPrice * quantity);
}

export function calculateMerchantCounterOffer(
  merchant: Merchant,
  crop: Crop,
  quantity: number,
  quality: number,
  playerOffer: number,
  currentRound: number,
  maxRounds: number
): number | null {
  const baseTotal = crop.basePrice * quantity * merchant.basePriceMultiplier;
  const qualityBonus = 1 + (quality - 50) / 100;
  const fairPrice = baseTotal * qualityBonus;

  const patienceFactor = merchant.patience / 5;
  const roundProgress = currentRound / maxRounds;

  let minAcceptable = fairPrice * 0.7;
  let targetPrice = fairPrice;

  switch (merchant.personality) {
    case 'aggressive':
      minAcceptable = fairPrice * 0.6;
      targetPrice = fairPrice * 1.1;
      break;
    case 'friendly':
      minAcceptable = fairPrice * 0.85;
      targetPrice = fairPrice * 0.95;
      break;
    case 'greedy':
      minAcceptable = fairPrice * 0.5;
      targetPrice = fairPrice * 1.2;
      break;
    case 'cautious':
      minAcceptable = fairPrice * 0.8;
      targetPrice = fairPrice;
      break;
    case 'mysterious':
      minAcceptable = fairPrice * (0.5 + Math.random() * 0.3);
      targetPrice = fairPrice * (0.9 + Math.random() * 0.3);
      break;
  }

  if (playerOffer >= targetPrice * (1 - roundProgress * 0.3 * patienceFactor)) {
    return playerOffer;
  }

  if (playerOffer < minAcceptable) {
    if (currentRound >= maxRounds - 1 || merchant.patience <= 2) {
      return null;
    }
  }

  const gap = targetPrice - playerOffer;
  const concession = gap * (0.2 + roundProgress * 0.3) * patienceFactor;
  const counterOffer = Math.max(minAcceptable, targetPrice - concession);

  if (counterOffer <= playerOffer) {
    return playerOffer;
  }

  return Math.round(counterOffer);
}

export function willMerchantAccept(
  merchant: Merchant,
  crop: Crop,
  quantity: number,
  quality: number,
  playerOffer: number,
  currentRound: number,
  maxRounds: number
): boolean {
  const baseTotal = crop.basePrice * quantity * merchant.basePriceMultiplier;
  const qualityBonus = 1 + (quality - 50) / 100;
  const fairPrice = baseTotal * qualityBonus;

  let minAcceptable: number;

  switch (merchant.personality) {
    case 'aggressive':
      minAcceptable = fairPrice * 0.6;
      break;
    case 'friendly':
      minAcceptable = fairPrice * 0.8;
      break;
    case 'greedy':
      minAcceptable = fairPrice * 0.5;
      break;
    case 'cautious':
      minAcceptable = fairPrice * 0.75;
      break;
    case 'mysterious':
      minAcceptable = fairPrice * (0.55 + Math.random() * 0.25);
      break;
    default:
      minAcceptable = fairPrice * 0.7;
  }

  const roundBonus = (currentRound / maxRounds) * 0.15 * (merchant.patience / 5);
  minAcceptable *= 1 - roundBonus;

  return playerOffer >= minAcceptable;
}

export function getMerchantDialogue(
  personality: string,
  situation: 'greeting' | 'offer' | 'counter' | 'accept' | 'reject' | 'leave'
): string {
  const dialogues: Record<string, Record<string, string[]>> = {
    aggressive: {
      greeting: ['我的时间很宝贵，直接报价吧。', '别浪费我的时间，开个价。'],
      offer: ['这是我的底价，爱要不要。', '就这个价，你看着办。'],
      counter: ['你在开玩笑吗？这也太低了！', '不可能，再加！'],
      accept: ['哼，算你走运。', '行吧，成交。'],
      reject: ['荒谬！我走了。', '简直是侮辱，再见！'],
      leave: ['浪费时间！', '以后别找我了。'],
    },
    friendly: {
      greeting: ['你好呀！今天有什么好货？', '很高兴见到你，我们来聊聊吧~'],
      offer: ['这个价格我觉得挺公道的，你觉得呢？', '我出这个价，希望我们都满意~'],
      counter: ['嗯...这个价格有点低呢，能不能再加点？', '哎呀，这个价我有点为难呀~'],
      accept: ['太好了！合作愉快~', '成交！期待下次合作！'],
      reject: ['好吧，虽然有点遗憾，但买卖不成仁义在~', '没关系，下次再说吧！'],
      leave: ['再见啦，保重！', '期待下次见面~'],
    },
    greedy: {
      greeting: ['有什么便宜货？我可不会出高价。', '快点，我还有别的生意。'],
      offer: ['这是最高价了，别不知足。', '就这么多，多一个子儿都没有。'],
      counter: ['你疯了吗？这东西值这么多？', '不可能，绝对不可能！'],
      accept: ['行吧行吧，算我亏了。', '唉，成交，下次可没这价了。'],
      reject: ['想都别想！走了。', '做梦！告辞。'],
      leave: ['哼，不识抬举。', '以后别想我再来。'],
    },
    cautious: {
      greeting: ['你好，让我先看看货。', '嗯...先了解一下情况。'],
      offer: ['根据我的计算，这个价格比较合理。', '我评估了一下，这是合理价格。'],
      counter: ['这个价格超出了我的风险预期...', '让我再想想...有点高了。'],
      accept: ['好吧，我觉得可以接受。', '行，就按这个价来。'],
      reject: ['抱歉，这个价格我无法接受。', '我觉得我们没法达成一致。'],
      leave: ['再见，希望以后有机会合作。', '保重，后会有期。'],
    },
    mysterious: {
      greeting: ['...你能看见我？', '命运指引我来到这里...'],
      offer: ['这个价格...是星辰的旨意。', '冥冥之中，这就是价格。'],
      counter: ['你的出价...扰动了命运之线。', '宇宙不认可这个价格...'],
      accept: ['命运...认可了这次交易。', '很好，一切都在预料之中。'],
      reject: ['星象显示...交易无法达成。', '命运...另有安排。'],
      leave: ['我们会再见的...在某个时空。', '星辰...暗淡了。'],
    },
  };

  const personalityDialogues = dialogues[personality] || dialogues.friendly;
  const situationDialogues = personalityDialogues[situation] || ['...'];
  return situationDialogues[Math.floor(Math.random() * situationDialogues.length)];
}
