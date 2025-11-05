export class LockService {
  private locks: Map<string, { expiresAt: number; promise: Promise<void> }> = new Map();
  private readonly DEFAULT_TIMEOUT = 60000; // 60 segundos

  async acquireLock(key: string, timeout: number = this.DEFAULT_TIMEOUT): Promise<() => void> {
    const lockKey = `sync:${key}`;
    
    // Limpiar locks expirados
    this.cleanExpiredLocks();

    // Si hay lock activo, esperar
    while (this.locks.has(lockKey)) {
      const existingLock = this.locks.get(lockKey)!;
      
      // Si expiró, eliminarlo
      if (Date.now() > existingLock.expiresAt) {
        this.locks.delete(lockKey);
        break;
      }

      // Esperar a que se libere
      await existingLock.promise;
    }

    // Crear nuevo lock
    let releaseLock: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = () => {
        this.locks.delete(lockKey);
        resolve();
      };
    });

    this.locks.set(lockKey, {
      expiresAt: Date.now() + timeout,
      promise: lockPromise,
    });

    return releaseLock!;
  }

  private cleanExpiredLocks(): void {
    const now = Date.now();
    for (const [key, lock] of this.locks.entries()) {
      if (now > lock.expiresAt) {
        this.locks.delete(key);
      }
    }
  }
}

