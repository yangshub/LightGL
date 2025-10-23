// 使用WeakMap缓存已处理对象
const processedCache = new WeakMap();
export function watchObj<T extends Object>(
  obj: T,
  callback: (obj: T) => void,
  { deep = true }: { deep?: boolean } = {}
): T {
  // 如果已处理过直接返回
  if (processedCache.has(obj)) {
    return processedCache.get(obj);
  }

  const proxy = !deep
    ? createProxy(obj, callback)
    : handleDeepProxy(obj, callback, { deep });

  processedCache.set(obj, proxy);
  return proxy;
}

// 提取公共Proxy创建逻辑
function createProxy<T extends Object>(
  target: T,
  callback: (obj: T) => void
): T {
  return new Proxy(target, {
    set(target, key, value) {
      if (target[key] !== value) {
        callback(target);
      }
      return true;
    },
  });
}

// 深度处理逻辑
function handleDeepProxy<T extends Object>(
  obj: T,
  callback: (obj: T) => void,
  { deep }: { deep: boolean }
): T {
  // 遍历处理子对象
  for (const key in obj) {
    const value = obj[key] as any;
    if (value && typeof value === "object") {
      // 递归处理并替换为代理对象
      obj[key] = watchObj(value, callback, { deep }) as any;
    }
  }

  // 创建父对象代理
  return createProxy(obj, callback);
}
