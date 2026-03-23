package com.project.oems.oemsapi.api.refdata;

import com.project.oems.oemsapi.application.refdata.InstrumentService;
import com.project.oems.oemsapi.domain.refdata.Instrument;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/instruments")
public class InstrumentController {

    private final InstrumentService instrumentService;

    public InstrumentController(InstrumentService instrumentService) {
        this.instrumentService = instrumentService;
    }

    @GetMapping("/{symbol}")
    public InstrumentResponse getBySymbol(@PathVariable String symbol) {
        Instrument instrument = instrumentService.getBySymbol(symbol);
        return InstrumentResponse.from(instrument);
    }
}
