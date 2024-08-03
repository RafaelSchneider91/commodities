const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const moment = require('moment-timezone'); // Importando a biblioteca moment-timezone

const app = express();
const port = process.env.PORT || 3000;

app.get('/getFinanceData', async (req, res) => {
    const symbol = req.query.symbol; // Obtém o símbolo da ação
    const date = req.query.date; // Obtém a data passada como parâmetro

    if (!symbol) {
        return res.status(400).send({ error: 'Símbolo é obrigatório' });
    }

    try {
        let quote;
        
        if (date) {
            // Busca dados históricos para a data específica
            const historicalData = await yahooFinance.historical(symbol, { period1: date, period2: date });
            if (historicalData.length > 0) {
                quote = historicalData[0];
            } else {
                return res.status(404).send({ error: 'Dados não encontrados para a data especificada' });
            }
        } else {
            // Busca os dados atuais se nenhuma data for especificada
            quote = await yahooFinance.quote(symbol);
        }

        // Captura a data e hora atual no timezone do Brasil (horário de Brasília)
        const currentDateTimeInBrazil = moment().tz('America/Sao_Paulo').format('YYYY-MM-DDTHH:mm:ssZ');

        // Retorna os dados em formato JSON
        res.json({
            symbol: quote.symbol,
            price: quote.regularMarketPrice || quote.close, // Usa regularMarketPrice ou close se for histórico
            currency: quote.currency,
            // date: date || 'Hoje', // Data especificada ou "Hoje" para dados atuais
            marketState: quote.marketState,
            requestTime: currentDateTimeInBrazil, // Inclui a data e hora da consulta no timezone do Brasil
            // Adicione outros dados conforme necessário
        });
    } catch (error) {
        console.error('Erro ao buscar dados da Yahoo Finance:', error);
        res.status(500).send({ error: 'Erro ao buscar dados financeiros' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
