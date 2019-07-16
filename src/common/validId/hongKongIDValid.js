// hongkung
export default class HongKongId {
    validate(id) {
        if (id.length !== 8 && id.length !== 9) {
            return {
                success: false,
                reason: '長度必須為八碼、九碼'
            };
        }

        if (!/[a-zA-Z]/.test(id)) {
            return {
                success: false,
                reason: '身分證格式錯誤'
            };
        }

        if (!/^[A-MP-Z]{1,2}[0-9]{6}[0-9A]$/.test(id)) {
            return {
                success: false,
                reason: '身分證格式錯誤'
            };
        }

        let char;
        let charValue;
        let checkDigit = id.slice(-1) === 'A' ? 10 : +id.slice(-1);
        let i;
        let identifier = id.slice(0, -1);
        let len;
        let remainder;
        let weight = id.length;
        let weightedSum = 0;

        for (i = 0, len = identifier.length; i < len; i++) {
            char = identifier[i];
            charValue = this.isLetter(char) ? this.getLetterValue(char) : +char;
            weightedSum += charValue * weight;
            weight--;
        }
        remainder = (weightedSum + checkDigit) % 11;

        if (remainder === 0) {
            return {
                success: true
            };
        } else {
            return {
                success: false,
                reason: '身分證格式不符合規定'
            };
        }

    }

    getLetterValue(letter) {
        return letter.charCodeAt(0) - 64;
    }

    isLetter(char) {
        return /[a-zA-Z]/.test(char);
    }
}
