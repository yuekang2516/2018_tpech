// taiwan
export default class TaiwanId {
    isLengthValid(id) {
        return id.length === 10;
    }
    isFormatValid(id) {
        return /^[A-Z][12][0-9]{8}$/.test(id);
    }
    isChecksumValid(id) {
        let char,
            i,
            idLen,
            idTail,
            len,
            letterIndex,
            letterValue,
            letters,
            remainder,
            weight,
            weightedSum;

        idLen = id.length;
        letters = 'ABCDEFGHJKLMNPQRSTUVXYWZIO';
        letterIndex = letters.indexOf(id[0]) + 10;
        letterValue = Math.floor(letterIndex / 10) + (letterIndex % 10) * (idLen - 1);
        idTail = id.slice(1);
        weight = idLen - 2;
        weightedSum = 0;
        for (i = 0, len = idTail.length; i < len; i++) {
            char = idTail[i];
            weightedSum += +char * weight;
            weight--;
        }
        remainder = (letterValue + weightedSum + +id.slice(-1)) % 10;
        return remainder === 0;
    }
    normalize(id) {
        let re;
        re = /[-\/\s]/g;
        id = id.toUpperCase().replace(re, '');
        re = /\([A-Z0-9]\)$/;
        if (re.test(id)) {
            id = id.replace(/[\(\)]/g, '');
        }
        return id;
    }
    validate(id) {
        id = this.normalize(id);

        if (!this.isLengthValid(id)) {
            return {
                success: false,
                reason: '長度必須為十碼'
            };
        }

        if (!this.isFormatValid(id)) {
            return {
                success: false,
                reason: '身分證格式錯誤'
            };
        }


        if (this.isChecksumValid(id)) {
            return {
                success: true,
                gender: parseInt(id.charAt(1))% 2 ? 'Male' : 'Female'
            };
        } else {
            return {
                success: false
            }
        }

    }

}
