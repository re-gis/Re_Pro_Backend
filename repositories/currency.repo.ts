import { EntityRepository, Repository } from "typeorm";
import Currency from "../entities/currency.entity";

@EntityRepository(Currency)
export class Currency_Repo extends Repository<Currency> {
    async deleteAll(): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(Currency)
        .execute();

      console.log('All currencies deleted successfully');
    } catch (error:any) {
      console.error('Error deleting currencies:', error.message);
      throw error;
    }
}
}