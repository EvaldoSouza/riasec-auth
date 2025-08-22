"use server";

import { prisma } from "@/lib/prisma";

export async function getAllTests() {
    try {
        const tests = await prisma.test.findMany({ orderBy:{createdAt: 'desc'}}) //mostrando o mais recente primeiro
        if(tests == null || tests.length === 0){
            console.log("Sem testes")
            //throw "Sem testes";
        }
        return tests
        
    } catch (error) {
        console.log(error)
        throw error;
    }
    
}
