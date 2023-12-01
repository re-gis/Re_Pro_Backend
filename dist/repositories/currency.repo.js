"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Currency_Repo = void 0;
const typeorm_1 = require("typeorm");
const currency_entity_1 = __importDefault(require("../entities/currency.entity"));
let Currency_Repo = class Currency_Repo extends typeorm_1.Repository {
    async deleteAll() {
        try {
            await this.createQueryBuilder()
                .delete()
                .from(currency_entity_1.default)
                .execute();
            console.log('All currencies deleted successfully');
        }
        catch (error) {
            console.error('Error deleting currencies:', error.message);
            throw error;
        }
    }
};
exports.Currency_Repo = Currency_Repo;
exports.Currency_Repo = Currency_Repo = __decorate([
    (0, typeorm_1.EntityRepository)(currency_entity_1.default)
], Currency_Repo);
