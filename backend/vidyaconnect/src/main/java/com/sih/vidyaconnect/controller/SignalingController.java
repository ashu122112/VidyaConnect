package com.sih.vidyaconnect.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class SignalingController {

    @MessageMapping("/signal/{sessionId}")
    @SendTo("/topic/signal/{sessionId}")
    public Object handleSignal(@Payload Object signalMessage, @DestinationVariable String sessionId) {
        // This method receives a message from a client on the "/app/signal/{sessionId}" destination
        // and broadcasts it to all subscribers of "/topic/signal/{sessionId}".
        // The payload is simply relayed without modification.
        return signalMessage;
    }
}

