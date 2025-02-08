
    export class SocketParseType {
        // 1111 #### (240 - (byte)0xF0)
        public static OBJECT = 0xF0;
        //1110 #### (234 - (byte)0xE0)
        public static STRING = 0xE0;
        //1101 #### (218 - (byte)0xD0)
        public static ARRAY = 0xD0;
        // 1100 #### (192 - (byte)0xC0)
        public static MAP = 0xC0;
        // 1011 #### (176 - (byte)0xB0)
        public static BYTE_ARRAY = 0xB0;
        // 1010 #### (160 - (byte)0xA0)
        public static DATE_TIME = 0xA0;
        // 1001 #### (144 - (byte)0x90)
        public static COLLECTION = 0x90;
        // 0101 #### ( 80 - (byte)0x50)
        public static ENUM = 0x50;
        // 0010 #### ( 32 - (byte)0x20),
        public static BOOLEAN = 0x20;
        // 0001 #### ( 16 - (byte)0x10),
        public static NUMBER = 0x10;
        // 0000 0001 (  1 - (byte)0x01)
        public static NULL = 0x01;
        // 0000 0000 (  0 - (byte)0x00)
        public static UNKOWN = 0x00;
    }
