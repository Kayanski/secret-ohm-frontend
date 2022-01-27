export function formatNumber(number, decimals) {
  return number.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDollars(number, decimals, currency = "USD") {
  return number.toLocaleString(undefined, {
    currency: currency,
    style: "currency",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatToken(number, decimals, tokenName) {
  return `${formatNumber(number, decimals)} ${tokenName}`;
}

export function formatPercent(number, decimals = 2) {
  return number.toLocaleString(undefined, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDays(timestamp, no_zeros = false) {
  let dhms = getDHMS(timestamp);
  let text = "";
  if (!no_zeros || dhms.days) {
    text += `${dhms.days} day`;
    if (dhms.days != 1) {
      text += "s";
    }
  }
  text += ` ${formatHours(timestamp)}`;
  return text;
}

export function formatHours(timestamp, no_zeros = false) {
  let dhms = getDHMS(timestamp);
  let text = "";
  if (!no_zeros || dhms.days || dhms.hours) {
    text += `${dhms.hours} hour`;
    if (dhms.hours != 1) {
      text += "s";
    }
  }
  if (!no_zeros || dhms.days || dhms.hours || dhms.minutes) {
    text += ` ${dhms.minutes} minute`;
    if (dhms.minutes != 1) {
      text += "s";
    }
  }
  if (!no_zeros || dhms.days || dhms.hours || dhms.minutes || dhms.seconds) {
    text += ` ${dhms.seconds} second`;
    if (dhms.seconds != 1) {
      text += "s";
    }
  }
  return text;
}

export function getDHMS(timestamp) {
  const days = Math.floor(timestamp / (3600 * 24));
  const hours = Math.floor((timestamp % (3600 * 24)) / 3600);
  const minutes = Math.floor((timestamp % 3600) / 60);
  const seconds = Math.floor(timestamp % 60);
  return {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
}
