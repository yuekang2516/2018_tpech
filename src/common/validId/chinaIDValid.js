// china
function getNumberFixedLength(number, length) {
    let str = number.toString();
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

//  https://segmentfault.com/a/1190000004437362
const CODE_TO_PROVINCE = {
    11: '北京',
    12: '天津',
    13: '河北',
    14: '山西',
    15: '內蒙古',
    21: '遼寧',
    22: '吉林',
    23: '黑龍江 ',
    31: '上海',
    32: '江蘇',
    33: '浙江',
    34: '安徽',
    35: '福建',
    36: '江西',
    37: '山東',
    41: '河南',
    42: '湖北 ',
    43: '湖南',
    44: '廣東',
    45: '廣西',
    46: '海南',
    50: '重慶',
    51: '四川',
    52: '貴州',
    53: '雲南',
    54: '西藏 ',
    61: '陝西',
    62: '甘肅',
    63: '青海',
    64: '寧夏',
    65: '新疆',
    71: '台灣',
    81: '香港',
    82: '澳門',
    91: '國外'
};
const CHECKSUM_WEIGHT = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const CHARACTER_MAPPING = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];


export default class ChineseId {

    validate(idNumber) {

        if (typeof idNumber !== 'string') {
            return {
                success: false,
                reason: '輸入錯誤'
            };
        }

        if (idNumber.length !== 18) {
            return {
                success: false,
                reason: '長度必須為18碼'
            };
        }

        const birthdayString =
            idNumber.substr(6, 4) + '-' + idNumber.substr(10, 2) + '-' + idNumber.substr(12, 2);
        const birthdayDate = new Date(birthdayString);
        const reformattedBirthdayString =
            birthdayDate.getFullYear() + '-' + getNumberFixedLength(birthdayDate.getMonth() + 1, 2) + '-' + getNumberFixedLength(birthdayDate.getDate(), 2);
        const currentTime = new Date().getTime();
        const birthdayTime = birthdayDate.getTime();

        // 校验位数是否是18位：
        if (!/^\d{17}(\d|x)$/i.test(idNumber)) {
            return {
                success: false,
                reason: '身分證格式錯誤'
            };
        }

        const provinceCode = idNumber.substr(0, 2);
        const provinceName = CODE_TO_PROVINCE[provinceCode];

        if (provinceName === undefined) {
            return {
                success: false,
                reason: '非法地區'
            };
        }


        if (birthdayTime >= currentTime || birthdayString !== reformattedBirthdayString) {
            return {
                success: false,
                reason: '非法生日'
            };
        }

        const residue = this.getCheckSumResidue(idNumber);

        if (residue !== idNumber.substr(17, 1)) {
            return {
                success: false,
                reason: '身分證格式錯誤'
            };
        }

        return {
            success: true,
            province: provinceName,
            birthday: birthdayString,
            gender: parseInt(idNumber.substr(16, 1)) % 2 ? 'Male' : 'Female'
        };
    }
    getCheckSumResidue(idNumber) {
        let checkSum = 0;

        for (let i = 0; i < 17; i++) {
            checkSum += parseInt(idNumber.substr(i, 1)) * CHECKSUM_WEIGHT[i];
        }

        return CHARACTER_MAPPING[checkSum % 11];
    }

}
