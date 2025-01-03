export class DatabaseClient<T> {
    getPool(): T {
        throw new Error("Method not Implemented.");
    }

    startTransaction() {
        throw new Error("Methot not Implemented.");
    }

    commitTransaction(client: any) {
        throw new Error("Methot not Implemented.");
    }

    rollbackTransaction(client: any) {
        throw new Error("Methot not Implemented.");
    }
}

export const DATABASE_CLIENT = 'DATABASE_CLIENT';